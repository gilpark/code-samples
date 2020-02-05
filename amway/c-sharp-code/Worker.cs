using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using Moments.Encoder;
using UniRx;
using UnityEngine;
using ThreadPriority = UnityEngine.ThreadPriority;

internal sealed class FrameWorker
	{
		private List<GifFrame> _frames;
		private MemoryStream _memoryStream;

		private int _width;
		private int _height;
		private int _repeat = -1;                  // -1: no repeat, 0: infinite, >0: repeat count
		private int _frameDelay = 0;               // Frame delay (milliseconds)
		private GifFrame _currentFrame;
		private byte[] _pixels;                    // BGR byte array from frame
		private byte[] _indexedPixels;             // Converted frame indexed to palette
		private int _colorDepth;                   // Number of bit planes
		private byte[] _colorTab;                  // RGB palette
		private bool[] _usedEntry = new bool[256]; // Active palette entries
		private int _paletteSize = 7;              // Color table size (bits-1)
		private int _disposalCode = -1;            // Disposal code (-1 = use default)
		private bool _isSizeSet = false;           // If false, get size from first frame
		private int _sampleInterval = 10;          // Default sample interval for quantizer
		
		internal FrameWorker(List<GifFrame> frames, int quality, int frameDelay)
		{
			_frames = frames;
			_memoryStream = new MemoryStream();
			_sampleInterval =  Mathf.Clamp(quality, 1, 30);
			_frameDelay = frameDelay;
		}
		internal IObservable<MemoryStream> GetMemoryStream()
		{
			return _frames
				.ToObservable(Scheduler.ThreadPool)
				.Do(AddFrame)
				.Last()
				.DoOnError(err => Debug.LogError(err))
				.Select(_=>
				{
					_memoryStream.Position = 0;		
					return _memoryStream;
				});
		}
		private void AddFrame(GifFrame frame)
		{
			if (frame == null)
				throw new ArgumentNullException("Can't add a null frame to the gif.");
			// Use first frame's size
			if (!_isSizeSet)
				SetSize(frame.Width, frame.Height);

			_currentFrame = frame;
			GetImagePixels();
			AnalyzePixels();
			WriteGraphicCtrlExt();
			WriteImageDesc();
			WritePalette();
			WritePixels();
		}
		
		private void SetSize(int w, int h)
		{
			_width = w;
			_height = h;
			_isSizeSet = true;
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
			NeuQuant nq = new NeuQuant(_pixels, len, (int)_sampleInterval);
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
			// Specify normal LCT
			_memoryStream.WriteByte(Convert.ToByte(0x80 |           // 1 local color table  1=yes
			                                       0 |              // 2 interlace - 0=no
			                                       0 |              // 3 sorted - 0=no
			                                       0 |              // 4-5 reserved
			                                       _paletteSize)); // 6-8 size of color table
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

	}
