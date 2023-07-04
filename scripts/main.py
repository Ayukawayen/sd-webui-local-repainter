import modules.scripts as scripts
import gradio as gr
import os

from PIL import Image

from modules.processing import create_infotext
from modules import generation_parameters_copypaste as parameters_copypaste
from modules import scripts_postprocessing
from modules import images


class Script(scripts.Script):  
    def title(self):
        return 'Local Repainter'
        
    def show(self, is_img2img):
        return scripts.AlwaysVisible if is_img2img else False

    def ui(self, is_img2img):
        def on_crop_click(original_image, invisible_box_info):
            if invisible_box_info == '':
                return None
            
            box = tuple(map(int, invisible_box_info.split(',')))
            result = original_image.crop(box)
            return result
            
        with gr.Accordion('Local Repainter', open=False):
            enable = gr.Checkbox(label='Enable')
            
            original_image = gr.Image(label='Original image', elem_id='local_repainter_original_image', source='upload', type='pil', tool=None)
            invisible_box_info = gr.Textbox(elem_id='local_repainter_box_info', visible=False)
            crop = gr.Button('Crop')
            
            cropped_image = gr.Image(label='Cropped image', elem_id='local_repainter_cropped_image', source='upload', type='pil', tool=None)
            sendTo = gr.Button('Send to img2img')
            
            masked_image = gr.Image(label='Mask image', elem_id='local_repainter_mask_image', source='upload', type='pil', tool=None)
            merge = gr.Button('Merge original image and mask image')
            
            original_image.upload(fn=None, _js='cropper_onImageUpload')
            original_image.clear(fn=None, _js='cropper_onImageClear')
            
            crop.click(fn=on_crop_click, inputs=[original_image, invisible_box_info], outputs=[cropped_image])
            merge.click(fn=None, _js='merger_onButtonClick')
            
            parameters_copypaste.register_paste_params_button(parameters_copypaste.ParamBinding(
                paste_button=sendTo, tabname='img2img', source_image_component=cropped_image
            ))
        return [enable, original_image, invisible_box_info]

    def process(self, p, *args):
        self.index = 0
    
    def postprocess_image(self, p, pp, enable, original_image, invisible_box_info):
        def maskize(image, size, box):
            result = Image.new('RGBA', size, (0,0,0,0))
            box_size = (box[2]-box[0], box[3]-box[1])
            result.paste(image.resize(box_size), (box[0], box[1]))
            return result
        def box_infotext(box):
            info = {'cx':(box[0]+box[2])/2, 'cy':(box[1]+box[3])/2, 'width':box[2]-box[0], 'height':box[3]-box[1], 'rotate':0}
            return str(info)
            
        if not enable:
            return
        if original_image is None:
            return
        if invisible_box_info == '':
            return
        
        box = tuple(map(int, invisible_box_info.split(',')))
        
        mask = maskize(pp.image, original_image.size, box)
        
        p.extra_generation_params.update({'Repaint box':box_infotext(box)})
        
        p.width = original_image.size[0]
        p.height = original_image.size[1]
        
        infotext = create_infotext(p, p.all_prompts, p.all_seeds, p.all_subseeds, iteration=p.iteration, position_in_batch=(self.index%p.batch_size))
        
        info = {'parameters':infotext}
        
        p.width = pp.image.size[0]
        p.height = pp.image.size[1]
        
        images.save_image(mask, path=p.outpath_samples, basename='', suffix='-mask', seed=p.all_seeds[self.index], prompt=p.prompt, p=p, existing_info=info)
        
        self.index += 1
