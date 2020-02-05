using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using DevToolKit.Utilities;
using Moments.Encoder;
using UniRx;
using UniRx.Diagnostics;
using UnityEngine;
using Debug = UnityEngine.Debug;

public class RGifEncoder
{
	private int _width;
	private int _height;
	private int _repeat = -1;                  // -1: no repeat, 0: infinite, >0: repeat count
	private int _frameDelay = 0;               // Frame delay (milliseconds)
	private bool _hasStarted = false;          // Ready to output frames
	private MemoryStream _memoryStream;
	private GifFrame _currentFrame;
	private byte[] _pixels;                    // BGR byte array from frame
	private byte[] _indexedPixels;             // Converted frame indexed to palette
	private int _colorDepth;                   // Number of bit planes
	private byte[] _colorTab;                  // RGB palette
	private bool[] _usedEntry = new bool[256]; // Active palette entries
	private int _paletteSize = 7;              // Color table size (bits-1)
	private int _disposalCode = -1;            // Disposal code (-1 = use default)
	private bool _isFirstFrame = true;
	private int _sampleInterval = 10;          // Default sample interval for quantizer
	private List<Color32[]> _rawFrames;
	private int _chunkSize = 10;
	//todo reset on app quick or disable
	public RGifEncoder(int repeat, int quality, List<Color32[]> rawFrames, int fps, int chunkSize, int width, int height)
	{
		_width = width;
		_height = height;
		_rawFrames = rawFrames;
		_chunkSize = chunkSize;
		_sampleInterval = Mathf.Clamp(quality, 1, 30);
		if (repeat >= 0)_repeat = repeat;
		SetFrameRate(fps);
	}
	public IObservable<MemoryStream> GetGifStream(bool debug = false)
	{
		return Observable.Create<MemoryStream>(obs =>
		{
			try
			{
				_memoryStream = new MemoryStream();
				WriteString("GIF89a"); //header
				_hasStarted = true;
			}
			catch (Exception e)
			{
				Debug.Log(e);
				obs.OnError(e);
			}
    
			var sw = new Stopwatch();
			if(debug) sw.Start();
			var gifFrames = _rawFrames.AsParallel()
				.Select(x => new GifFrame {Width = _width, Height = _height, Data = x})
				.ToList();
			var firstFrame = gifFrames[0];
			gifFrames.RemoveAt(0);
			AddFrame(firstFrame);
			var workerStreams = gifFrames.SplitList(_chunkSize).Select(frames =>
			{
				var w = new FrameWorker(frames, _sampleInterval,_frameDelay);
				return w.GetMemoryStream();
			});
			var parallel =
				Observable.WhenAll(workerStreams)
					.Subscribe(streams =>
					{
						if (!_hasStarted)
							throw new InvalidOperationException("<Color=Red>[GetGifStream]Can't finish a non-started gif.</Color>");
						_hasStarted = false;
						try
						{
							if(debug)Debug.Log($"<Color=yellow>[GetGifStream]merging memory streams b4 size{_memoryStream.Length}</Color>");
							foreach (var memoryStream in streams)
								memoryStream.CopyTo(_memoryStream);
							var cnt = 0;
							foreach (var memoryStream in streams)
							{
								memoryStream.Close();
								memoryStream.Dispose();
								if(debug)Debug.Log($"<Color=yellow>[GetGifStream]sub memory stream-{cnt++} has disposed</Color>");

							}
							_memoryStream.WriteByte(0x3b); // Gif trailer
							_memoryStream.Position = 0;
							if (debug)
							{
								Debug.Log($"<Color=yellow>[GetGifStream]merging memory streams after size{_memoryStream.Length}</Color>");
								sw.Stop();
								Debug.Log($"<Color=yellow>[GetGifStream]Total process time: {sw.Elapsed.Duration().ToString(@"m\:ss\.ff")}</Color>");
							}
							obs.OnNext(_memoryStream);
							// Reset for subsequent use
							_memoryStream = null;
							_currentFrame = null;
							_pixels = null;
							_indexedPixels = null;
							_colorTab = null;
							_isFirstFrame = true;
							obs.OnCompleted();
						}
						catch (Exception e)
						{
							Debug.Log(e);
							obs.OnError(e);
						}
					});
			return Disposable.Create(() =>
			{
				if(debug)Debug.Log("<Color=yellow>[GetGifStream] has been disposed</Color>");
				parallel.Dispose();
				sw = null;
			});
		});
	}
	/// <summary>
	/// Sets the delay time between each frame, or changes it for subsequent frames (applies
	/// to last frame added).
	/// </summary>
	/// <param name="ms">Delay time in milliseconds</param>
	private void SetDelay(int ms)
	{
		_frameDelay = Mathf.RoundToInt(ms / 10f);
	}
	/// <summary>
	/// Sets frame rate in frames per second. Equivalent to <code>SetDelay(1000/fps)</code>.
	/// </summary>
	/// <param name="fps">Frame rate</param>
	private void SetFrameRate(float fps)
	{
		if (fps > 0f)
			_frameDelay = Mathf.RoundToInt(100f / fps);
	}
	/// <summary>
	/// Adds next GIF frame. The frame is not written immediately, but is actually deferred
	/// until the next frame is received so that timing data can be inserted. Invoking
	/// <code>Finish()</code> flushes all frames.
	/// </summary>
	/// <param name="frame">GifFrame containing frame to write.</param>
	private void AddFrame(GifFrame frame)
	{
		if (frame == null)
			throw new ArgumentNullException("Can't add a null frame to the gif.");
		if (!_hasStarted)
			throw new InvalidOperationException("Call Start() before adding frames to the gif.");
		_currentFrame = frame;
		GetImagePixels();
		AnalyzePixels();
		if (_isFirstFrame)
		{
			WriteLSD();
			WritePalette();
			if (_repeat >= 0)
				WriteNetscapeExt();
		}
		WriteGraphicCtrlExt();
		WriteImageDesc();
		if (!_isFirstFrame)
			WritePalette();
		WritePixels();
		_isFirstFrame = false;
	}
	// Extracts image pixels into byte array "pixels".
	//todo optimize this
	//https://softwareengineering.stackexchange.com/questions/212808/treating-a-1d-data-structure-as-2d-grid
	private void GetImagePixels()
	{
		_pixels = new Byte[3 * _currentFrame.Width * _currentFrame.Height];
		Color32[] p = _currentFrame.Data;
		int count = 0;
		// Texture data is layered down-top, so flip it
		for (int th = _currentFrame.Height - 1; th >= 0; th--)
		{
				
			for (int tw = 0; tw < _currentFrame.Width; tw++)
			{
				Color32 color = p[th * _currentFrame.Width + tw];
				_pixels[count] = color.r; count++;
				_pixels[count] = color.g; count++;
				_pixels[count] = color.b; count++;
			}
		}
	}
	// Analyzes image colors and creates color map.
	private void AnalyzePixels()
	{
		int len = _pixels.Length;
		int nPix = len / 3;
		_indexedPixels = new byte[nPix];
		NeuQuant nq = new NeuQuant(_pixels, len, _sampleInterval);
		_colorTab = nq.Process(); // Create reduced palette
		// Map image pixels to new palette
		int k = 0;
		for (int i = 0; i < nPix; i++)
		{
			int index = nq.Map(_pixels[k++] & 0xff, _pixels[k++] & 0xff, _pixels[k++] & 0xff);
			_usedEntry[index] = true;
			_indexedPixels[i] = (byte)index;
		}
		_pixels = null;
		_colorDepth = 8;
		_paletteSize = 7;
	}
	// Writes Graphic Control Extension.
	private void WriteGraphicCtrlExt()
	{
		_memoryStream.WriteByte(0x21); // Extension introducer
		_memoryStream.WriteByte(0xf9); // GCE label
		_memoryStream.WriteByte(4);    // Data block size
		// Packed fields
		_memoryStream.WriteByte(Convert.ToByte(0 |     // 1:3 reserved
		                                       0 |     // 4:6 disposal
		                                       0 |     // 7   user input - 0 = none
		                                       0));    // 8   transparency flag

		WriteShort(_frameDelay); // Delay x 1/100 sec
		_memoryStream.WriteByte(Convert.ToByte(0)); // Transparent color index
		_memoryStream.WriteByte(0); // Block terminator
	}
	// Writes Image Descriptor.
	private void WriteImageDesc()
	{
		_memoryStream.WriteByte(0x2c); // Image separator
		WriteShort(0);                // Image position x,y = 0,0
		WriteShort(0);
		WriteShort(_width);          // image size
		WriteShort(_height);
		// Packed fields
		if (_isFirstFrame)
		{
			_memoryStream.WriteByte(0); // No LCT  - GCT is used for first (or only) frame
		}
		else
		{
			// Specify normal LCT
			_memoryStream.WriteByte(Convert.ToByte(0x80 |           // 1 local color table  1=yes
			                                       0 |              // 2 interlace - 0=no
			                                       0 |              // 3 sorted - 0=no
			                                       0 |              // 4-5 reserved
			                                       _paletteSize)); // 6-8 size of color table
		}
	}
	// Writes Logical Screen Descriptor.
	private void WriteLSD()
	{
		// Logical screen size
		WriteShort(_width);
		WriteShort(_height);
		// Packed fields
		_memoryStream.WriteByte(Convert.ToByte(0x80 |           // 1   : global color table flag = 1 (gct used)
		                                       0x70 |           // 2-4 : color resolution = 7
		                                       0x00 |           // 5   : gct sort flag = 0
		                                       _paletteSize)); // 6-8 : gct size

		_memoryStream.WriteByte(0); // Background color index
		_memoryStream.WriteByte(0); // Pixel aspect ratio - assume 1:1
	}
	// Writes Netscape application extension to define repeat count.
	private void WriteNetscapeExt()
	{
		_memoryStream.WriteByte(0x21);    // Extension introducer
		_memoryStream.WriteByte(0xff);    // App extension label
		_memoryStream.WriteByte(11);      // Block size
		WriteString("NETSCAPE" + "2.0"); // App id + auth code
		_memoryStream.WriteByte(3);       // Sub-block size
		_memoryStream.WriteByte(1);       // Loop sub-block id
		WriteShort(_repeat);            // Loop count (extra iterations, 0=repeat forever)
		_memoryStream.WriteByte(0);       // Block terminator
	}
	// Write color table.
	private void WritePalette()
	{
		_memoryStream.Write(_colorTab, 0, _colorTab.Length);
		int n = (3 * 256) - _colorTab.Length;

		for (int i = 0; i < n; i++)
			_memoryStream.WriteByte(0);
	}
	// Encodes and writes pixel data.
	private void WritePixels()
	{
		LzwEncoder encoder = new LzwEncoder(_width, _height, _indexedPixels, _colorDepth);
		encoder.Encode(_memoryStream);
	}
	// Write 16-bit value to output stream, LSB first.
	private void WriteShort(int value)
	{
		_memoryStream.WriteByte(Convert.ToByte(value & 0xff));
		_memoryStream.WriteByte(Convert.ToByte((value >> 8) & 0xff));
	}
	// Writes string to output stream.
	private void WriteString(String s)
	{
		char[] chars = s.ToCharArray();

		for (int i = 0; i < chars.Length; i++)
			_memoryStream.WriteByte((byte)chars[i]);
	}
	public static IObservable<string> SaveToFile(IObservable<MemoryStream> src, string filePath)
	{
		return src
			.Do(ms =>
			{
				using (var fs = new FileStream(filePath, FileMode.OpenOrCreate, FileAccess.Write, FileShare.None))
				{
					try
					{
						byte[] bytes = new byte[ms.Length];
						ms.Read(bytes, 0, (int) ms.Length);
						fs.Write(bytes, 0, bytes.Length);
						ms.Close();
						ms.Dispose();
						Debug.Log($"<Color=yellow>[GetGifStream] file saved at {filePath}</Color>");
					}
					catch (Exception e)
					{
						Observable.Throw<Exception>(e);
						Debug.Log(e);
						throw;
					}
				}
			})
			.Select(_ => filePath);
	}

	public void Reset()
	{
		Debug.Log("<Color=yellow>[GetGifStream] gif encoder terminated</Color>");
		if (_memoryStream != null)
		{
			_memoryStream.Close();
			_memoryStream.Dispose();	
		}
		_memoryStream = null;
		_currentFrame = null;
		_pixels = null;
		_indexedPixels = null;
		_colorTab = null;
		_isFirstFrame = true;
	}
}
