/* This file should be in a folder called `js` */

var sun_data;

async function parseUrlAndInit() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let city = null;
  let date = null;

  if (pathParts.length >= 1) {
    city = decodeURIComponent(pathParts[0].toLowerCase());
    date = new Date();
  }
  if (pathParts.length === 2) {
    date = new Date(pathParts[1]);
    if (isNaN(date.getTime())) {
      alert("Invalid date format. Use yyyy-mm-dd.");
      return;
    }
  }

  if (city) {
    const cityMap = await fetch("/cities.json").then(r => r.json());
    const cityData = cityMap[city];

    if (!cityData) {
      alert("City not found in database.");
      return;
    }

    loadApp(cityData.lat, cityData.lon, date, city);
  } else {
    getLocation();
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      loadApp(pos.coords.latitude, pos.coords.longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser!");
  }
}

function loadApp(latitude, longitude, dateObj = new Date(), cityName = null) {
  const today = new Date(dateObj);
  const yday = new Date(today);
  const tmrw = new Date(today);
  yday.setDate(today.getDate() - 1);
  tmrw.setDate(today.getDate() + 1);
  const wday = today.getDay();

  const yyyy = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  document.getElementById('date').innerHTML = yyyy + "-" + padZeroes(m) + "-" + padZeroes(d);
  document.getElementById('place').innerHTML = cityName
    ? cityName.charAt(0).toUpperCase() + cityName.slice(1)
    : `(${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;

  const times = SunCalc.getTimes(today, latitude, longitude);
  const t_rise = get_float_h(times['sunrise']);
  const t_set = get_float_h(times['sunset']);
  const t_set_yday = get_float_h(SunCalc.getTimes(yday, latitude, longitude)['sunset']);
  const t_rise_tmrw = get_float_h(SunCalc.getTimes(tmrw, latitude, longitude)['sunrise']);

  document.getElementById('prabodha').innerHTML = getKaalaTimings(t_set_yday-24, t_rise, 24, 30, 30).substring(0, 5) + '–';
  document.getElementById('ushah').innerHTML = getKaalaTimings(t_set_yday-24, t_rise, 25, 30, 30).substring(0, 5) + '–';
  document.getElementById('braahma').innerHTML = getKaalaTimings(t_set_yday-24, t_rise, 13, 14, 15);
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

  const RAHUKALA_SLICES = [7, 1, 6, 4, 5, 3, 2];
  const YAMAGHANTA_SLICES = [4, 3, 2, 1, 0, 6, 5];
  const YAMAGHANTA_SLICES_NIGHT = [0, 6, 5, 4, 3, 2, 1];
  const GULIKAKALA_SLICES = [6, 5, 4, 3, 2, 1, 0];
  const GULIKAKALA_SLICES_NIGHT = [2, 1, 0, 6, 5, 4, 3];

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
  };

  startTime();
}

function startTime() {
  const today = new Date();
  const h = today.getHours();
  const m = today.getMinutes();
  const s = today.getSeconds();
  const ms = today.getMilliseconds();
  let t_now = h * 3600 + m * 60 + s + ms / 1000;
  let offset = 0;

  const SEC_IN_HR = 3600;
  const t_rise = sun_data["t_rise"] * SEC_IN_HR;
  const t_set = sun_data["t_set"] * SEC_IN_HR;
  const t_set_yday = sun_data["t_set_yday"] * SEC_IN_HR;
  const t_rise_tmrw = sun_data["t_rise_tmrw"] * SEC_IN_HR;

  if (t_now >= t_set) {
    t_now = Math.round((t_now - t_set) / (t_rise_tmrw - t_set + 86400) * 30 * 60 * 60);
    offset = 30;
  } else if (t_now < t_rise) {
    t_now = Math.round((t_now - t_set_yday + 86400) / (t_rise - t_set_yday + 86400) * 30 * 60 * 60);
    offset = 30;
  } else {
    t_now = Math.round((t_now - t_rise) / (t_set - t_rise) * 30 * 60 * 60);
  }

  let s_now = t_now % 3600;
  let h_now = Math.floor(t_now / 3600);
  let m_now = Math.floor((t_now - h_now * 3600) / 60);
  s_now = t_now % 60;
  h_now += offset;

  document.getElementById('vtime').textContent = `${h_now}-${padZeroes(m_now)}-${padZeroes(s_now)}`;
  document.getElementById('ist').textContent = `${padZeroes(h)}:${padZeroes(m)}:${padZeroes(s)}`;

  setTimeout(startTime, 100);
}

function padZeroes(i) {
  return i < 10 ? "0" + i : i;
}

function trimSeconds(s) {
  return s.substring(0, 5);
}

function get_hms_str(myDate) {
  return `${padZeroes(myDate.getHours())}:${padZeroes(myDate.getMinutes())}:${padZeroes(myDate.getSeconds())}`;
}

function get_float_h(myDate) {
  return myDate.getHours() + myDate.getMinutes() / 60 + myDate.getSeconds() / 3600 + myDate.getMilliseconds() / 3600000;
}

function floatTimeToDms(floatTime) {
  const hh = Math.floor(floatTime);
  const mm = Math.floor((floatTime - hh) * 60);
  const ss = Math.round((((floatTime - hh) * 60) - mm) * 60);
  return `${padZeroes(hh)}:${padZeroes(mm)}:${padZeroes(ss)}`;
}

function getKaalaTimings(t_start, t_end, slice_start, slice_end, num_slices) {
  const start_time = t_start + (t_end - t_start) * slice_start / num_slices;
  const end_time = t_start + (t_end - t_start) * slice_end / num_slices;
  const kaala_start = floatTimeToDms(start_time);
  const kaala_end = floatTimeToDms(end_time);
  return trimSeconds(kaala_start) + '–' + trimSeconds(kaala_end);
}

// hexClock();
// setInterval(hexClock, 1000);