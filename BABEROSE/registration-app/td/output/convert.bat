cd D:\Project\baberose\04_DEV\registration-app\td\output 
ffmpeg -i D:\Project\baberose\04_DEV\registration-app\td\output\out.mp4 -filter_complex "[0]reverse[r];[0][r]concat,loop=0:61,setpts=N/30/TB" -y D:\Project\baberose\04_DEV\registration-app\td\output\convert.mp4 
ffmpeg -t 4 -i D:\Project\baberose\04_DEV\registration-app\td\output\convert.mp4 -filter_complex "[0:v] fps=15,scale=w=540:h=-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" -y D:\Project\baberose\04_DEV\registration-app\td\output\output.gif 
