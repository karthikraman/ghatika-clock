/* This file should be in a folder called `js` */

var sun_data;

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    alert("Geolocation is not supported by this browser!");
  }
}

function startTime() {

  var today = new Date();

  SEC_IN_HR = 3600;

  var t_set_yday = sun_data["t_set_yday"] * SEC_IN_HR; //18;
  var t_rise_tmrw = sun_data["t_rise_tmrw"] * SEC_IN_HR; //6;

  var t_rise = sun_data["t_rise"] * SEC_IN_HR; //6;
  var t_set = sun_data["t_set"] * SEC_IN_HR; //8;

  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();

  var ms = today.getMilliseconds();

  var t_now = h * 60 * 60 + m * 60 + s + ms/1000;

  var offset = 0;

  if (t_now >= t_set)
  {t_now = Math.round((t_now - t_set)/(t_rise_tmrw - t_set + 86400) * 30  * 60  * 60 );
    offset = 30;}
  else if (t_now < t_rise)
  {
    t_now = Math.round((t_now - t_set_yday + 86400)/(t_rise - t_set_yday + 86400) * 30  * 60  * 60 );
    offset = 30;}
  else
  {t_now = Math.round((t_now - t_rise)/(t_set - t_rise) * 30 * 60 * 60 );}

  var s_now = t_now % 3600
  var h_now = (t_now - s_now)/ 3600;

  t_now = t_now - (h_now * 3600);
  s_now = t_now % 60;

  m_now = (t_now - s_now)/60;
  h_now = h_now + offset
  
  document.getElementById('vtime').textContent =
  h_now + "-" + padZeroes(m_now) + "-" + padZeroes(s_now);
  document.getElementById('ist').textContent =
  padZeroes(h) + ":" + padZeroes(m) + ":" + padZeroes(s);
  var t = setTimeout(startTime, 100);
}

function padZeroes(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function trimSeconds(s){
  return s.substring(0, 5);
}

function get_hms_str(myDate){
  var hh = myDate.getHours();
  var mm = myDate.getMinutes();
  var ss = myDate.getSeconds();
  return padZeroes(hh) + ':' + padZeroes(mm) + ':'+padZeroes(ss); 
}

function floatTimeToDms(floatTime) {
  // From ChatGPT!
  // Convert the float time to degrees
  var hh = Math.floor(floatTime);
  // Calculate the number of minutes as the decimal part of the float time
  // multiplied by 60
  var mm = Math.floor((floatTime - hh) * 60);
  // Calculate the number of seconds by multiplying the decimal part of the
  // minutes by 60 and rounding to the nearest integer
  var ss = Math.round((((floatTime - hh) * 60) - mm) * 60);

  // Return the result as an object
  return padZeroes(hh) + ':' + padZeroes(mm) + ':'+padZeroes(ss); 
}

function get_float_h(myDate){
  var h = myDate.getHours();
  var m = myDate.getMinutes();
  var s = myDate.getSeconds();
  var ms = myDate.getMilliseconds();

  return h + m / 60 + s / 60 / 60  + ms/60/60/1000;
}

function getKaalaTimings(t_start, t_end, slice_start, slice_end, num_slices)
{
  start_time = t_start + (t_end - t_start) * slice_start/num_slices
  end_time = t_start + (t_end - t_start) * slice_end/num_slices

  kaala_start = floatTimeToDms(start_time);
  kaala_end = floatTimeToDms(end_time);
  return trimSeconds(kaala_start) + '–' + trimSeconds(kaala_end);
}

function showPosition(position) {
  var today = new Date();
  var yday = new Date();
  var tmrw = new Date();
  today.setDate(today.getDate());
  tmrw.setDate(today.getDate() + 1);
  var wday = today.getDay();

  var yyyy = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();

  document.getElementById('date').innerHTML = yyyy + "-" + padZeroes(m) + "-" + padZeroes(d)
  document.getElementById('place').innerHTML = "(" + position.coords.latitude + "°, " + position.coords.longitude + "°)";

  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  // for (var z of ["rahu", "yama", "gulika", "braahma",

  var times = SunCalc.getTimes(today, latitude, longitude);
  var t_rise = get_float_h(times['sunrise']);
  var t_set = get_float_h(times['sunset']);

  var t_set_yday = get_float_h(SunCalc.getTimes(yday, latitude, longitude)['sunset']);

  var t_rise_tmrw = get_float_h(SunCalc.getTimes(tmrw, latitude, longitude)['sunrise']);

  document.getElementById('braahma').innerHTML = getKaalaTimings(t_set_yday-24, t_rise, 13, 15, 15);
  document.getElementById('prAtaH sandhyA').innerHTML = getKaalaTimings(t_set_yday-24, t_rise, 14, 15, 15).substring(0, 5) + '–' +  getKaalaTimings(t_rise, t_set, 4, 5, 15).substring(0,5);
  document.getElementById('mAdhyAhnika sandhyA').innerHTML = getKaalaTimings(t_rise, t_set, 5, 13, 15);
  document.getElementById('sAyaM sandhyA').innerHTML = getKaalaTimings(t_rise, t_set, 14, 15, 15).substring(0, 5) + '–' +  getKaalaTimings(t_set, t_rise_tmrw + 24, 1, 2, 15).substring(0, 5);
  document.getElementById('prAtaH').innerHTML = getKaalaTimings(t_rise, t_set, 0, 1, 5);
  document.getElementById('saGgava').innerHTML = getKaalaTimings(t_rise, t_set, 1, 2, 5);
  document.getElementById('madhyAhna').innerHTML = getKaalaTimings(t_rise, t_set, 2, 3, 5);
  document.getElementById('aparAhna').innerHTML = getKaalaTimings(t_rise, t_set, 3, 4, 5);
  document.getElementById('sAyAhna').innerHTML = getKaalaTimings(t_rise, t_set, 4, 5, 5);
  document.getElementById('dinAnta').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, 5, 5, 8).substring(0, 5);
  document.getElementById('rAtri yAma 1').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, 0, 1, 4);
  document.getElementById('sayana').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, 2, 3, 8);

  RAHUKALA_SLICES = [7, 1, 6, 4, 5, 3, 2]
  YAMAGHANTA_SLICES = [4, 3, 2, 1, 0, 6, 5]
  YAMAGHANTA_SLICES_NIGHT = [0, 6, 5, 4, 3, 2, 1]
  GULIKAKALA_SLICES = [6, 5, 4, 3, 2, 1, 0]
  GULIKAKALA_SLICES_NIGHT = [2, 1, 0, 6, 5, 4, 3]

  document.getElementById('rahu').innerHTML = getKaalaTimings(t_rise, t_set, RAHUKALA_SLICES[wday], RAHUKALA_SLICES[wday] + 1, 8);
  document.getElementById('yama').innerHTML = getKaalaTimings(t_rise, t_set, YAMAGHANTA_SLICES[wday], YAMAGHANTA_SLICES[wday] + 1, 8);
  document.getElementById('yama_night').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, YAMAGHANTA_SLICES_NIGHT[wday], YAMAGHANTA_SLICES_NIGHT[wday] + 1, 8);
  document.getElementById('gulika').innerHTML = getKaalaTimings(t_rise, t_set, GULIKAKALA_SLICES[wday], GULIKAKALA_SLICES[wday] + 1, 8);
  document.getElementById('gulika_night').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, GULIKAKALA_SLICES_NIGHT[wday], GULIKAKALA_SLICES_NIGHT[wday] + 1, 8);
  


  document.getElementById('sunrise').innerHTML = trimSeconds(get_hms_str(times["sunrise"]));
  document.getElementById('sunset').innerHTML = trimSeconds(get_hms_str(times["sunset"]));
  document.getElementById('midday').innerHTML = getKaalaTimings(t_rise, t_set, 1, 2, 2).substring(0,5);
  document.getElementById('midnight').innerHTML = getKaalaTimings(t_set, t_rise_tmrw + 24, 1, 2, 2).substring(0,5);
  document.getElementById('sunrise_tmrw').innerHTML = getKaalaTimings(t_rise_tmrw, t_rise_tmrw, 1, 2, 2).substring(0,5);

  sun_data = {
    "t_set_yday": t_set_yday,
    "t_rise": t_rise,
    "t_set": t_set,
    "t_rise_tmrw": t_rise_tmrw,
  }

  startTime();
  
}

// hexClock();
// setInterval(hexClock, 1000);