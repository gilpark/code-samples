using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DevToolKit.Utilities;
using UniRx;
using UniRx.Async;
using UniRx.Diagnostics;
using UnityEngine;
using UnityEngine.Rendering;
using Debug = UnityEngine.Debug;

[RequireComponent(typeof(Camera)), DisallowMultipleComponent]
public class RRecorder : MonoBehaviour
{
    public bool autoAspect = false;
    public bool repeat;
    public bool isBoomerang;
    public bool isSandwich;

    [Min(8)] public int width = 320;
    [Min(8)] public int height = 200;
    [Range(1, 60)] public int targetFps = 15;
    [Range(1, 100)] public int quality = 80;
    [Range(5, 20)] public int chunkSize = 10;
    [Min(0.1f)] public float recordTime = 3f;
    public List<Texture2D> insertFrames = new List<Texture2D>();
    private Camera _camera;
    private RGifEncoder _encoder;
    private int _maxFrameCount;
    private readonly Queue<AsyncGPUReadbackRequest> _requests = new Queue<AsyncGPUReadbackRequest>();
    private List<Color32[]> _rawFrames = new List<Color32[]>();
    private float EstimatedMemoryUse
    {
        get
        {
            float mem = targetFps * recordTime;
            mem *= width * height * 4;
            mem /= 1024 * 1024;
            return mem;
        }
    }
    private readonly BoolReactiveProperty _isRecording = new BoolReactiveProperty(false);
    private List<Color32[]> _insertFrames;
    private IEnumerator Start()
    {
        Debug.Log("<Color=Green><b>[RRecorder]</b> Estimated VRAM usage : " +
                  $"{EstimatedMemoryUse.ToString("F2")}mb</Color>");
        _camera = GetComponent<Camera>();
        if (autoAspect) height = Mathf.RoundToInt(width / _camera.aspect);

        yield return new WaitForSeconds(1f);
        _timePerFrame = 1f / targetFps;
        _time = 0f;
        var appManager = AppManager.Instance;
        isBoomerang = AppManager.AppType != AppType.XS;
        isSandwich = AppManager.AppType == AppType.XS;
        recordTime = appManager.GetRECDuration();
        _maxFrameCount = Mathf.RoundToInt(recordTime * targetFps);
        Debug.Log($"boomerang:{isBoomerang}, sandwitch:{isSandwich}, recTime:{recordTime}, maxFrameCount: {_maxFrameCount}");
        if (insertFrames.Count == 0 && !isSandwich) yield break;
        var insertW = insertFrames[0].width;
        var insertH = insertFrames[0].height;
        
        if (_insertFrames == null)
        {
            insertFrames.Sort((s1, s2) =>string.Compare(s1.name, s2.name, StringComparison.Ordinal));
            _insertFrames = insertFrames.Select(x => x.GetPixels32())
                .Select(buffer => ResampleAndCrop(buffer, insertW, insertH, width, height))
                .AsParallel().ToList();    
        }
        else
        {
            Debug.Log("insert frames??  " + _insertFrames.Count);
        }
        yield return new WaitForSeconds(2f);
#if !UNITY_EDITOR
        insertFrames.ForEach(DestroyImmediate);				
#endif
        insertFrames.Clear();
		Resources.UnloadUnusedAssets();
    }

    private List<Color32[]> ReorderFrames(List<Color32[]> frames)
    {
        var gifFrames = frames.GetRange(0, frames.Count);
        if (isBoomerang)
        {
            var reverse = frames.GetRange(0, frames.Count);
            reverse.Reverse();
            reverse.RemoveAt(0); //remove overlapped frame
            gifFrames = gifFrames.Concat(reverse).ToList();
        }
        if (isSandwich)
        {
            var outFrames = _insertFrames.GetRange(0, _insertFrames.Count);
            outFrames.Reverse();
            gifFrames = _insertFrames.Concat(gifFrames).Concat(outFrames).ToList();
        }
        return gifFrames;
    }

    //todo combine sample frames and preview
    public IObservable<MemoryStream> GetGifAsMemoryStream(bool debug = false)
    {
        if (_rawFrames.Count != 0)
            return Observable.Start(() =>
            {
                var gifFrames = ReorderFrames(_rawFrames);
                var qVal = (float) quality;
                var q = Mathf.RoundToInt(qVal.FromTo(1, 100, 30, 1));
                _encoder = new RGifEncoder(repeat ? 0 : -1, q, gifFrames, targetFps, chunkSize, width, height);
                return _encoder.GetGifStream(debug)
                    .DoOnTerminate(() => _encoder.Reset())
                    .DoOnError(err =>
                    {
                        Debug.Log(err);
                        _encoder.Reset();
                    }).DoOnCancel(() =>_encoder.Reset())
                    .DoOnCompleted(() =>_encoder.Reset());
            }, Scheduler.ThreadPool).Merge();
        Debug.LogError("cannot process if frame count 0");
        throw new Exception("cannot process if frame count 0");
    }
    
    public IObservable<string> GetGifAsFile(string filePath, bool debug = false)
    {
        if (_rawFrames.Count != 0)
            return Observable.Start(() =>
            {
                var gifFrames = ReorderFrames(_rawFrames);
                var qVal = (float) quality;
                var q = Mathf.RoundToInt(qVal.FromTo(1, 100, 30, 1));
                _encoder = new RGifEncoder(repeat ? 0 : -1, q, gifFrames, targetFps, chunkSize, width, height);
                return RGifEncoder.SaveToFile(_encoder.GetGifStream(debug), filePath)
                    .DoOnTerminate(() => _encoder.Reset())
                    .DoOnError(err =>
                    {
                        Debug.Log(err);
                        _encoder.Reset();
                    }).DoOnCancel(() =>_encoder.Reset())
                    .DoOnCompleted(() =>_encoder.Reset());
            }, Scheduler.ThreadPool).Merge();
        Debug.LogError("cannot process if frame count 0");
        throw new Exception("cannot process if frame count 0");
    }
    private IObservable<Color32[]> Sample()
    {
        return Observable.Create<Color32[]>(obs =>
        {
            _frameCount = -1;
            _isRecording.Value = true;
            var onUpdate = Observable.EveryUpdate()
                .TakeWhile(_ => _isRecording.Value)
                .DoOnError(obs.OnError)
                .Do(x =>
                {
                    while (_requests.Count > 0)
                    {
                        var req = _requests.Peek();
                        if (req.hasError)
                        {
                            _requests.Dequeue();
                        }
                        else if (req.done)
                        {
                            var buffer = ResampleAndCrop(req.GetData<Color32>().ToArray(), _camera.pixelWidth,
                                _camera.pixelHeight, width, height);
                            obs.OnNext(buffer);
                            _requests.Dequeue();
                        }
                        else break;
                    }
                    if (!(_frameCount >= _maxFrameCount)) return;
                    _isRecording.Value = false;
                    obs.OnCompleted();
                }).Subscribe();
            return Disposable.Create(() =>
            {
                Debug.Log("<Color=Green><b>[RRecorder]</b> sampling done</Color>");
                onUpdate.Dispose();
            });
        });
    }

    private async UniTask<List<Texture2D>> Convert(IList<Color32[]> rawData)
    {
        var returnData = new List<Texture2D>();
        foreach (var data in rawData)
        {
            var tex = new Texture2D(width, height, TextureFormat.RGBA32, false)
                {hideFlags = HideFlags.HideAndDontSave};
            tex.SetPixels32(data);
            await UniTask.DelayFrame(1);
            tex.Apply();
            await UniTask.DelayFrame(1);
            returnData.Add(tex);
        }
        return returnData;
    }

    public IObservable<List<Texture2D>> GetPreview(bool isBoomerang)
    {
        return Observable.Create<List<Texture2D>>(obs =>
        {
            _rawFrames.Clear();
            var stream = Sample()
                .Buffer(_maxFrameCount)
                .Do(frames =>
                {
                    _rawFrames = (List<Color32[]>) frames;
                })
                .SelectMany(x => Convert(x).ToObservable())
                .DoOnError(obs.OnError)
                .DoOnCompleted(obs.OnCompleted)
                .Subscribe(x =>
                {
                    if (!isBoomerang)
                    {
                        obs.OnNext(x);
                        return;
                    }
                    var reverse = x.GetRange(0, x.Count);
                    reverse.Reverse();
                    reverse.RemoveAt(0);
                    var previews = x.Concat(reverse).ToList();
                    obs.OnNext(previews);
                });
            return Disposable.Create(() =>
            {
                stream.Dispose();
            });
        });
    }
    private float _time;
    private float _timePerFrame;
    private float _frameCount;
    private void OnRenderImage(RenderTexture source, RenderTexture destination)
    {
        if (!_isRecording.Value)
        {
            Graphics.Blit(source, destination);
            return;
        }

        _time += Time.unscaledDeltaTime;
        if (_time >= _timePerFrame)
        {
            _time -= _timePerFrame;

            if (_requests.Count < 8)
                _requests.Enqueue(AsyncGPUReadback.Request(source));
            else
                Debug.Log("Too many requests.");
            _frameCount++;
        }
        Graphics.Blit(source, destination);
    }
    private static Color32[] ResampleAndCrop(Color32[] source, int srcWidth, int srcHeight, int targetWidth, int targetHeight)
    {
        var sourceWidth = srcWidth;
        var sourceHeight = srcHeight;
        var sourceAspect = (float)sourceWidth / sourceHeight;
        var targetAspect = (float)targetWidth / targetHeight;
        var xOffset = 0;
        var yOffset = 0;
        var factor = 1f;
        if (sourceAspect > targetAspect)
        { // crop width
            factor = (float)targetHeight / sourceHeight;
            xOffset = (int)((sourceWidth - sourceHeight * targetAspect) * 0.5f);
        }
        else
        { // crop height
            factor = (float)targetWidth / sourceWidth;
            yOffset = (int)((sourceHeight - sourceWidth / targetAspect) * 0.5f);
        }
        var srcdata = source;
        var outdata = new Color32[targetWidth * targetHeight];
        Parallel.For(0,targetHeight, y =>
        {
            for (int x = 0; x < targetWidth; x++)
            {
                var p = new Vector2(Mathf.Clamp(xOffset + x / factor, 0, sourceWidth - 1), Mathf.Clamp(yOffset + y / factor, 0, sourceHeight - 1));
                // bilinear filtering
                var c11 = srcdata[Mathf.FloorToInt(p.x) + sourceWidth * (Mathf.FloorToInt(p.y))];
                var c12 = srcdata[Mathf.FloorToInt(p.x) + sourceWidth * (Mathf.CeilToInt(p.y))];
                var c21 = srcdata[Mathf.CeilToInt(p.x) + sourceWidth * (Mathf.FloorToInt(p.y))];
                var c22 = srcdata[Mathf.CeilToInt(p.x) + sourceWidth * (Mathf.CeilToInt(p.y))];
                outdata[x + y * targetWidth] = Color.Lerp(Color.Lerp(c11, c12, p.y), Color.Lerp(c21, c22, p.y), p.x);
            }
        });
        return outdata;
    }

    private void OnDisable()
    {
        _rawFrames.Clear();
        _insertFrames.Clear();
//        insertFrames.ForEach(Destroy);
#if !UNITY_EDITOR
					insertFrames.ForEach(DestroyImmediate);				
#endif
        insertFrames.Clear();
        if (_encoder == null) return;
            _encoder.Reset();
            _encoder = null;
    }

    private void OnApplicationQuit()
    {
        _rawFrames.Clear();
        _insertFrames.Clear();
#if !UNITY_EDITOR
					insertFrames.ForEach(DestroyImmediate);				
#endif
        insertFrames.Clear();
        if (_encoder == null) return;
        _encoder.Reset();
        _encoder = null;
    }
}

