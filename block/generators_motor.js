
//Block from IKB1 


module.exports = function(Blockly) {

  Blockly.JavaScript['WIT_motor'] = function(block) {
  var dropdown_ch = block.getFieldValue('ch');
  var dropdown_dir = block.getFieldValue('dir');
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC);
  
  if(dropdown_dir == '1'){
	var code = 'motor(' + dropdown_ch + ', ' + value_speed + ');\n';
  }else if(dropdown_dir == '2'){
	var code = 'motor(' + dropdown_ch + ', ' + -value_speed + ');\n';
  }
  
  return code;
};
Blockly.JavaScript['WIT_servo'] = function(block) {
  var dropdown_ch = block.getFieldValue('ch');
  var value_angle = Blockly.JavaScript.valueToCode(block, 'angle', Blockly.JavaScript.ORDER_ATOMIC) || 0;
  var code = 'servo(' + dropdown_ch + ', ' + value_angle + ');\n';
  return code;
};

Blockly.JavaScript['WIT_servo2'] = function(block) {
  var dropdown_ch = block.getFieldValue('ch');
  var dropdown_dir = block.getFieldValue('dir');
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || 0;
  var code = 'servo2(' + dropdown_ch + ', ' + dropdown_dir +', ' + value_speed + ');\n';
  return code;
};
Blockly.JavaScript['nano_motor_forward'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  //code += 'motor(1, ' + value_speed + ');\t';
  //code += 'motor(2, ' + value_speed + ');\n';
  code += 'fd(' + value_speed + ');\n';
  return code;
};

Blockly.JavaScript['nano_motor_backward'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  //code += 'motor(1, ' + -value_speed + ');\t';
  //code += 'motor(2, ' + -value_speed + ');\n';
  code += 'bk(' + value_speed + ');\n';
  return code;
};

Blockly.JavaScript['WIT_motor_turn_left'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'tl(' + value_speed + ');\n';
  return code;
};

Blockly.JavaScript['WIT_motor_turn_right'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'tr(' + value_speed + ');\n';
  return code;
};

Blockly.JavaScript['WIT_motor_spin_left'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'sl( ' + value_speed + ');\n';
  return code;
};

Blockly.JavaScript['WIT_motor_spin_right'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'sr( ' + -value_speed + ');\n';
  return code;
};

Blockly.JavaScript['nano_motor_stop'] = function(block) {  
  var code = 'ao();\n';
  return code;
};

Blockly.JavaScript['nano_motor_stop_ch'] = function(block) {
  var dropdown_ch = block.getFieldValue('ch');
  var code = 'motor(' + dropdown_ch + ', 0);\n';
  return code;
};

Blockly.JavaScript['WIT_motor_forward2'] = function(block) {
  var value_speed1 = Blockly.JavaScript.valueToCode(block, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var value_speed2 = Blockly.JavaScript.valueToCode(block, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'motor(1,  ' + value_speed1 + ');\t';
  code += 'motor(2,  ' + value_speed2 + ');\n';
  return code;
};

Blockly.JavaScript['WIT_motor_backward2'] = function(block) {
  var value_speed1 = Blockly.JavaScript.valueToCode(block, 'speed1', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var value_speed2 = Blockly.JavaScript.valueToCode(block, 'speed2', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'motor(1,  ' + -value_speed1 + ');\t';
  code += 'motor(2,  ' + -value_speed2 + ');\n';
  return code;
};

Blockly.JavaScript['Run_following_of_line'] = function(block) {
  var value_speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = '';
  code += 'Run_following_of_line( ' + value_speed + ');\n';
  return code;
};
}
