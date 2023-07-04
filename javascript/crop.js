const cropper = {
	boxInfo:null,
	
	svg:null,
	rect:null,
	circles:{},
	
	w:0,
	h:0,
	scale:1,
	
	box:{},
	startBox:{},
	start:{x:0,y:0},
	target:null,
	isDragging:false,
};

document.addEventListener('mouseup', cropper_onMouseUp);
document.addEventListener('mousemove', cropper_onMouseMove);

const cursorNames = { l:'ew', r:'ew', t:'ns', b:'ns'};

function cropper_onImageUpload(ev) {
	let img = document.querySelector('#local_repainter_original_image img');
	
	img.addEventListener('load', cropper_onImageLoad);
}
function cropper_onImageClear() {
	if(!cropper.svg) return;
	
	cropper.svg.parentNode.removeChild(cropper.svg);
	cropper.svg = null;
}

function cropper_onImageLoad() {
	let img = document.querySelector('#local_repainter_original_image img');
	img.parentNode.style.position = 'relative';
	
	cropper.boxInfo = document.querySelector('#local_repainter_box_info textarea');
	
	cropper_createSvg(img);
	
	cropper.w = img.naturalWidth;
	cropper.h = img.naturalHeight;
	
	cropper.svg.setAttribute('width', cropper.w);
	cropper.svg.setAttribute('height', cropper.h);
	
	cropper.scale = Math.min(img.width/cropper.w, img.height/cropper.h);
	
	cropper.svg.style.transform = `scale(${cropper.scale}) translate(-50%, -50%)`;
	
	cropper.box = {
		l: Math.round(cropper.w*0.4),
		r: Math.round(cropper.w*0.6),
		t: Math.round(cropper.h*0.4),
		b: Math.round(cropper.h*0.6),
	};
	
	cropper_refreshBox();
}

function cropper_createSvg(img) {
	if(cropper.svg) return;
	
	cropper.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	cropper.svg.classList.add('local_repainter_svg');
	
	cropper.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	cropper.rect.classList.add('local_repainter_box');
	cropper.rect.setAttribute('fill', 'transparent');
	cropper.rect.setAttribute('stroke', '#000');
	cropper.rect.setAttribute('stroke-width', '2');
	cropper.svg.appendChild(cropper.rect);

	['l','r','t','b'].forEach((k)=>{
		cropper.circles[k] = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		cropper.circles[k].setAttribute('r', '11');
		cropper.circles[k].setAttribute('fill', 'rgba(255,255,255,0.5)');
		cropper.circles[k].setAttribute('stroke', 'rgba(0,0,0,0.5)');
		cropper.circles[k].setAttribute('stroke-width', '2');
		
		cropper.circles[k].style.cursor = `${cursorNames[k]}-resize`;
		
		cropper.circles[k].addEventListener('mousedown', function(ev) {
			cropper.target = k;
			cropper_onMouseDown(ev);
		});
		
		cropper.svg.appendChild(cropper.circles[k]);
	});
	
	img.parentNode.insertBefore(cropper.svg, img);
}

function cropper_onMouseUp() {
	cropper.isDragging = false;
}

function cropper_onMouseDown(ev) {
	cropper.isDragging = true;

	cropper.start = {
		x: ev.x,
		y: ev.y,
	};
	
	['l','r','t','b'].forEach((k)=>{
		cropper.startBox[k] = cropper.box[k];
	});
}

let event;

function cropper_onMouseMove(ev) {
	if (!cropper.isDragging) return;
	
	let d;
	let m;
	
	if(cropper.target=='l' || cropper.target=='r') {
		d = ev.x - cropper.start.x;
		m = cropper.w;
	} else {
		d = ev.y - cropper.start.y;
		m = cropper.h;
	}
	
	cropper.box[cropper.target] = cropper.startBox[cropper.target] + d/cropper.scale;
	cropper.box[cropper.target] = Math.max(0, Math.min(m, Math.round(cropper.box[cropper.target])))
	
	cropper_refreshBox();
}

function cropper_onMouseOut(ev) {
	console.log('cropper_onMouseOut');
}

function cropper_refreshBox() {
	let l = cropper.box.l;
	let r = cropper.box.r;
	let t = cropper.box.t;
	let b = cropper.box.b;
	
	cropper.rect.setAttribute('x', Math.min(l,r));
	cropper.rect.setAttribute('y', Math.min(t,b));
	cropper.rect.setAttribute('width', Math.abs(r-l));
	cropper.rect.setAttribute('height', Math.abs(b-t));
	
	cropper.circles.l.setAttribute('cx', l);
	cropper.circles.r.setAttribute('cx', r);
	cropper.circles.t.setAttribute('cx', (l+r)/2);
	cropper.circles.b.setAttribute('cx', (l+r)/2);
	
	cropper.circles.l.setAttribute('cy', (t+b)/2);
	cropper.circles.r.setAttribute('cy', (t+b)/2);
	cropper.circles.t.setAttribute('cy', t);
	cropper.circles.b.setAttribute('cy', b);
	
	if(cropper.boxInfo) {
		cropper.boxInfo.value = [Math.min(l,r), Math.min(t,b), Math.max(l,r), Math.max(t,b)].join(',');
		
		cropper.boxInfo.dispatchEvent(new InputEvent('input', {}));
	}
}
