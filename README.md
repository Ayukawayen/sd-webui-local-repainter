# SD Webui Local Repainter 0.1.0
Local repainter for Stable Diffusion WebUI
![sample](https://raw.githubusercontent.com/Ayukawayen/sd-webui-local-repainter/main/publicfiles/sample.png "")

## Usage
### To generate mask image
![](https://raw.githubusercontent.com/Ayukawayen/sd-webui-local-repainter/main/publicfiles/01.png "")
1. Enable
2. 上傳、拖放、或貼上圖片
   1. 調整方框位置(拖曳邊線上的控制點)及點擊"Crop"直到局部圖符合需求為止。
3. 點擊"Send to img2img"
4. 設定生成參數
   1. 建議使用"Resize by"控制圖片尺寸，使用整數倍率(非整數倍率在某些尺寸下會發生錯誤)。
5. 填寫提詞
6. 點擊"Generate"
7. 等待執行完成

執行完成後的圖片目錄：

![](https://raw.githubusercontent.com/Ayukawayen/sd-webui-local-repainter/main/publicfiles/file_browser.png "")

額外生成含透明遮罩的重繪圖片，儲存於同一目錄下，檔名內標註"-mask"。


### To merge with mask image
![](https://raw.githubusercontent.com/Ayukawayen/sd-webui-local-repainter/main/publicfiles/02.png "")
1. 上傳、拖放、或貼上遮罩圖片
2. 點擊"Merge original image and mask image"開啟編輯界面
3. 按住滑鼠左鍵移動將方型區域塗改為原始圖片；按住滑鼠右鍵移動將方型區域塗改為重繪圖片。
   1. 點選"🖫"下載合併圖片
   2. 點選"×"關閉編輯界面

(此功能可在任何時間點合併兩張既有圖片，不限於此次生成之圖片。)


## Advanced Usage
![](https://raw.githubusercontent.com/Ayukawayen/sd-webui-local-repainter/main/publicfiles/advance.png "")
* 加入提詞控制表情
* 搭配inpaint使用
