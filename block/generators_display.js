const nativeImage = require('electron').nativeImage;
var createBuffer = function(pixels,width,height){
  var depth = 4,
      pixelsLen = pixels.length,
      unpackedBuffer = [],
      threshold = 120;

  var buffer = new Buffer((width *  (Math.ceil(height / 8) * 8)) / 8);  
  buffer.fill(0x00);// filter pixels to create monochrome image data
  for (var i = 0; i < pixelsLen; i += depth) { // just take the red value
    var pixelVal = pixels[i + 1] = pixels[i + 2] = pixels[i];
    pixelVal = (pixelVal > threshold)? 1 : 0;    
    unpackedBuffer[i/depth] = pixelVal; // push to unpacked buffer list
  }
  for(var x = 0;x < width; x++){
    for(var y = 0; y < height; y+=8){
      for(var cy = 0; cy < 8; cy++){
        var iy = y+cy;
        if(iy >= height){ break; }
        buffer[x*Math.ceil(height/8) + Math.floor(y/8)] |= unpackedBuffer[iy*width + x] << cy;
      }
    }
  }
  return buffer;
};

module.exports = function(Blockly){
  'use strict';
  Blockly.JavaScript['i2c128x64_create_image'] = function(block) {
    var dataurl = block.inputList[1].fieldRow["0"].src_;
    var image = nativeImage.createFromDataURL(dataurl);
    var size = image.getSize();
    var buff = createBuffer(image.getBitmap(),size.width,size.height);
    var hexStringArr = '';
    for(let i=1;i<=buff.length;i++){
      hexStringArr += (buff[i-1] < 16)? `0x0${buff[i-1].toString(16)},` : `0x${buff[i-1].toString(16)},`;
      if(i % 20 == 0){ hexStringArr += '\n'; }
    }
    hexStringArr = hexStringArr.trim();
    if(hexStringArr.endsWith(',')){
      hexStringArr = hexStringArr.substring(0,hexStringArr.length - 1);
    }
    var code = `(std::vector<uint8_t>{${hexStringArr}})`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['i2c128x64_display_image'] = function(block) {
  var value_img = Blockly.JavaScript.valueToCode(block, 'img', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);  
  var code = `display.drawFastImage(${value_x}, ${value_y}, ${value_width},${value_height},${value_img}.data());\n`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_clear'] = function(block) {  
  var code = 'display.clearDisplay();\n';
  return code;
};

Blockly.JavaScript['i2c128x64_display_display'] = function(block) {  
  var code = 'display.display();\n';
  return code;
};

Blockly.JavaScript['i2c128x64_display_print'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  
  var code = 
`
display.setTextSize(${dropdown_font});
display.setCursor(${value_x},${value_y});
display.println(${value_text});
`;
  return code;
};

Blockly.JavaScript['i2c128x64_hilight_text'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  
  var code = 
`
display.setTextSize(${dropdown_font});
display.setTextColor(BLACK, WHITE);
display.setCursor(${value_x},${value_y});
display.println(${value_text});
display.setTextColor(WHITE, BLACK);
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_print_scroll_left'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_step = Blockly.JavaScript.valueToCode(block, 'step', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_dir = block.getFieldValue('dir');  
  var dropdown_font = block.getFieldValue('font');  
  
  var strH = -10;
  if( dropdown_font == "1"){
	  strH = -10;
  }else if( dropdown_font == "2"){
	  strH = -16;
  }else if( dropdown_font == "3"){
	  strH = -24;
  }
  
  if(dropdown_dir == "UP"){
	var code = 
	`
	int txtH = ${strH};
	int scrH = 64;
	int iy;

	display.setTextSize(${dropdown_font});
	for (iy = scrH; iy >= txtH; iy -= ${value_step}) {
		display.clearDisplay();
		display.setCursor(${value_x},iy);
		display.println(${value_text});
		display.display();
		delay(100);
	}
	`;
  }else if(dropdown_dir == "DOWN"){
	var code = 
	`
	int txtH = ${strH};
	int scrH = 64;
	int iy;

	display.setTextSize(${dropdown_font});
	for (iy = txtH; iy <= scrH; iy += ${value_step}) {
		display.clearDisplay();
		display.setCursor(${value_x},iy);
		display.println(${value_text});
		display.display();
		delay(100);
	}
	`;

	  
  }
  
  return code;
};

Blockly.JavaScript['i2c128x64_display_print_display'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  
  var code = 
`
display.clearDisplay();
display.setFont(${dropdown_font});
display.drawString(${value_x},${value_y},String(${value_text}));
display.display();
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_print_display_center'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  

  var code = 
`
display.setFont(${dropdown_font});
display.drawString(((display.width() - display.getStringWidth(${value_text}))/2),${value_y},${value_text});
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_print_display_center_one'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);
  
  var dropdown_font = block.getFieldValue('font');  
  if(dropdown_font == 'ArialMT_Plain_10'){
	var h = 10;  
  }else if(dropdown_font == 'ArialMT_Plain_16'){
	var h = 16; 
  }else if(dropdown_font == 'ArialMT_Plain_24'){
	var h = 24;  
  }

  var code = 
`
display.setFont(${dropdown_font});
display.drawString(((display.width() - display.getStringWidth(${value_text}))/2), ((display.height() - ${h})/2) ,${value_text});
`;
  return code;
};


Blockly.JavaScript['i2c128x64_display_print_number'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'number', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  
  var code = 
`
display.setTextSize(${dropdown_font});
display.setCursor(${value_x},${value_y});
display.println(${value_text});
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_print_number_display'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'number', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_font = block.getFieldValue('font');  
  var code = 
`
display.clearDisplay();
display.setFont(${dropdown_font});
display.drawString(${value_x},${value_y},String(${value_text}));
display.display();
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_draw_line'] = function(block) {
  var value_x0 = Blockly.JavaScript.valueToCode(block, 'x0', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y0 = Blockly.JavaScript.valueToCode(block, 'y0', Blockly.JavaScript.ORDER_ATOMIC);
  var value_x1 = Blockly.JavaScript.valueToCode(block, 'x1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y1 = Blockly.JavaScript.valueToCode(block, 'y1', Blockly.JavaScript.ORDER_ATOMIC);  
  var code = `display.drawLine(${value_x0},${value_y0},${value_x1},${value_y1},WHITE);\n`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_draw_rect'] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);
  var checkbox_fill = block.getFieldValue('fill') == 'TRUE';  
  if(checkbox_fill){
    var code = `display.fillRect(${value_x},${value_y},${value_width},${value_height},WHITE);\n`;
  }else{
    var code = `display.drawRect(${value_x},${value_y},${value_width},${value_height},WHITE);\n`;
  }
  return code;
};

Blockly.JavaScript['i2c128x64_display_draw_circle'] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_r = Blockly.JavaScript.valueToCode(block, 'r', Blockly.JavaScript.ORDER_ATOMIC);
  var checkbox_fill = block.getFieldValue('fill') == 'TRUE';
  if(checkbox_fill){
    var code = `display.fillCircle(${value_x},${value_y},${value_r},WHITE);\n`;
  }else{
    var code = `display.drawCircle(${value_x},${value_y},${value_r},WHITE);\n`;
  }  
  return code;
};

Blockly.JavaScript['i2c128x64_display_draw_progress_bar'] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);
  var value_progress = Blockly.JavaScript.valueToCode(block, 'progress', Blockly.JavaScript.ORDER_ATOMIC);
  var checkbox_fill = block.getFieldValue('fill') == 'TRUE';
  if(checkbox_fill){
	var code = `display.fillRoundRect(${value_x}, ${value_y}, ${value_width}, ${value_height}, ${value_progress},WHITE);\n`;
  }else{
    var code = `display.drawRoundRect(${value_x}, ${value_y}, ${value_width}, ${value_height}, ${value_progress},WHITE);\n`;
  } 
  return code;
};

Blockly.JavaScript['i2c128x64_display_draw_pixel'] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var checkbox_color = (block.getFieldValue('color') == 'TRUE')?'WHITE':'BLACK';  
  var code = `
display.drawPixel(${value_x}, ${value_y}, ${checkbox_color});
`;
  return code;
};

Blockly.JavaScript['i2c128x64_display_string_width'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'text', Blockly.JavaScript.ORDER_ATOMIC);  
  var code = `display.getStringWidth(${value_text})`;  
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['i2c128x64_display_width'] = function(block) {  
  var code = 'display.width()';  
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['i2c128x64_display_height'] = function(block) {  
  var code = 'display.height()';  
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['led_green_on'] = function(block) {  
  var code = 'botton.digitalWrite(P3, HIGH);\n';
  return code;
};

Blockly.JavaScript['led_green_off'] = function(block) {  
  var code = 'botton.digitalWrite(P3, LOW);\n';
  return code;
};

Blockly.JavaScript['led_select_display'] = function(block) {
  var value_color = block.getFieldValue('color');  
  var value_status = block.getFieldValue('status');  
  var v_color;
  var v_status;
  if(value_color == 'green')  v_color = 'P3';
  if(value_color == 'yellow')  v_color = 'P4';
  if(value_color == 'red')  v_color = 'P5';
  if(value_color == 'blue')  v_color = 'P6';
  if(value_color == 'rgb')  v_color = 'P7';
  
  if(value_status == 'on')  v_status = 'HIGH';
  if(value_status == 'off')  v_status = 'LOW';
  
  //var code = 'botton.digitalWrite(${v_color}, ${v_status});\n';
  var code = `
botton.digitalWrite(${v_color},${v_status});
`;

  return code;
};
}
