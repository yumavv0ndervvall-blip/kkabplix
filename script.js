const $ = (id) => document.getElementById(id);
const PRESET_KEY = 'streamingCardMakerPresets';

const state = {
  bgData: '',
  logoData: '',
  bgX: 50,
  bgY: 50,
  bgZoom: 100,
  overlay: 52,
  blur: 0,
  logoSize: 42,
  ratio: '1200x900'
};

const defaults = {
  tagline: '내 인생의 행운은 전부 요리 덕에 찾아왔다',
  year: '2014',
  runtime: '1시간 54분',
  quality: 'HD',
  ageRating: '15',
  extraBadges: '?,⌁,♬,◉,●',
  synopsis: '창의력이 지글지글 끓어오르는 셰프. 똑같은 메뉴만 고집하는 주인과 지지고 볶은 후 허름한 푸드트럭을 차리면서 맛깔나는 좌충우돌 여정에 오른다. 낡은 트럭과 함께 길 위를 떠돌며 새로운 맛과 사람, 실패와 우정을 차곡차곡 끓여내는 동안 한때 잃어버렸던 자존감과 열정도 다시 살아난다. 배고플 땐 보지 말 것!',
  cast: '존 파브로, 소피아 베르가라, 존 레귀자모',
  genres: '미국 작품, 코미디 영화, 인디 영화',
  features: '힐링, 진심이 통하는, 진심 어린'
};

function setText(inId, outId) {
  const input = $(inId);
  const out = $(outId);
  const sync = () => out.textContent = input.value;
  input.addEventListener('input', sync);
  sync();
}

['year','runtime','quality','cast','genres','features','ageRating'].forEach(id => setText(id, id + 'Out'));

$('synopsis').addEventListener('input', () => $('synopsisOut').textContent = $('synopsis').value);
$('synopsisOut').textContent = $('synopsis').value;

function syncTagline() {
  const txt = $('tagline').value.trim();
  const midpoint = Math.ceil(txt.length * 0.48);
  let split = txt.lastIndexOf(' ', midpoint);
  if (split < 4) split = txt.indexOf(' ', midpoint);
  if (split > 0 && txt.length > 18) {
    $('taglineOut').innerHTML = escapeHtml(txt.slice(0, split)) + '<br>' + escapeHtml(txt.slice(split + 1));
  } else {
    $('taglineOut').textContent = txt;
  }
}
$('tagline').addEventListener('input', syncTagline);
syncTagline();

function escapeHtml(s){
  return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function handleFile(input, cb){
  input.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  });
}

handleFile($('bgUpload'), data => {
  state.bgData = data;
  $('bgLayer').style.backgroundImage = `url(${data})`;
});

handleFile($('logoUpload'), data => {
  state.logoData = data;
  $('logoPreview').src = data;
  $('logoPreview').classList.remove('hidden');
  $('logoPlaceholder').classList.add('hidden');
});

$('removeLogoBtn').addEventListener('click', () => {
  state.logoData = '';
  $('logoPreview').src = '';
  $('logoPreview').classList.add('hidden');
  $('logoPlaceholder').classList.remove('hidden');
  $('logoUpload').value = '';
});

function bindRange(id, fn){
  $(id).addEventListener('input', () => fn(Number($(id).value)));
  fn(Number($(id).value));
}

bindRange('bgX', v => {state.bgX=v; updateBg();});
bindRange('bgY', v => {state.bgY=v; updateBg();});
bindRange('bgZoom', v => {state.bgZoom=v; updateBg();});
bindRange('blur', v => {state.blur=v; updateBg();});
bindRange('overlay', v => {state.overlay=v; $('darkLayer').style.background = `rgba(0,0,0,${v/100})`;});
bindRange('logoSize', v => {state.logoSize=v; $('logoPreview').style.width = `${v}%`;});

function updateBg(){
  $('bgLayer').style.backgroundPosition = `${state.bgX}% ${state.bgY}%`;
  $('bgLayer').style.transform = `scale(${state.bgZoom/100})`;
  $('bgLayer').style.filter = `blur(${state.blur}px)`;
}

function applyRatio(value){
  state.ratio = value;
  const [w,h] = value.split('x').map(Number);
  const card = $('captureCard');
  card.style.width = `${w}px`;
  card.style.height = `${h}px`;
  $('stageSizeLabel').textContent = `${w} × ${h}`;
  fitPreview();
}
$('ratio').addEventListener('change', () => applyRatio($('ratio').value));

function fitPreview(){
  const frame = document.querySelector('.stage-frame');
  const card = $('captureCard');
  const [w,h] = state.ratio.split('x').map(Number);
  const maxW = Math.max(240, frame.clientWidth - 46);
  const maxH = Math.max(240, window.innerHeight - 120);
  const scale = Math.min(maxW / w, maxH / h, 1);
  card.style.transform = `scale(${scale})`;
  card.style.margin = `${-(h*(1-scale))/2}px ${-(w*(1-scale))/2}px`;
}
window.addEventListener('resize', fitPreview);

function updateBadges(){
  const container = $('ratingIcons');
  container.innerHTML = '';

  const ageChip = document.createElement('span');
  ageChip.id = 'ageRatingOut';
  ageChip.className = 'rating-chip orange';
  ageChip.textContent = $('ageRating').value || '15';
  container.appendChild(ageChip);

  const extras = $('extraBadges').value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, 6);

  extras.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'rating-chip';
    chip.textContent = item;
    container.appendChild(chip);
  });
}
$('extraBadges').addEventListener('input', updateBadges);
$('ageRating').addEventListener('input', updateBadges);
updateBadges();

function collectFormData(){
  return {
    tagline: $('tagline').value,
    year: $('year').value,
    runtime: $('runtime').value,
    quality: $('quality').value,
    ageRating: $('ageRating').value,
    extraBadges: $('extraBadges').value,
    synopsis: $('synopsis').value,
    cast: $('cast').value,
    genres: $('genres').value,
    features: $('features').value,
    ratio: $('ratio').value,
    filename: $('filename').value,
    bgX: Number($('bgX').value),
    bgY: Number($('bgY').value),
    bgZoom: Number($('bgZoom').value),
    overlay: Number($('overlay').value),
    blur: Number($('blur').value),
    logoSize: Number($('logoSize').value),
    bgData: state.bgData,
    logoData: state.logoData
  };
}

function applyFormData(data){
  const all = {...defaults, ...data};
  ['tagline','year','runtime','quality','ageRating','extraBadges','synopsis','cast','genres','features','filename'].forEach(id => {
    if(all[id] !== undefined && $(id)) $(id).value = all[id];
  });
  if (all.ratio) $('ratio').value = all.ratio;
  if (all.bgX !== undefined) $('bgX').value = all.bgX;
  if (all.bgY !== undefined) $('bgY').value = all.bgY;
  if (all.bgZoom !== undefined) $('bgZoom').value = all.bgZoom;
  if (all.overlay !== undefined) $('overlay').value = all.overlay;
  if (all.blur !== undefined) $('blur').value = all.blur;
  if (all.logoSize !== undefined) $('logoSize').value = all.logoSize;

  state.bgX = Number($('bgX').value);
  state.bgY = Number($('bgY').value);
  state.bgZoom = Number($('bgZoom').value);
  state.overlay = Number($('overlay').value);
  state.blur = Number($('blur').value);
  state.logoSize = Number($('logoSize').value);

  if (all.bgData) {
    state.bgData = all.bgData;
    $('bgLayer').style.backgroundImage = `url(${all.bgData})`;
  }

  if (all.logoData) {
    state.logoData = all.logoData;
    $('logoPreview').src = all.logoData;
    $('logoPreview').classList.remove('hidden');
    $('logoPlaceholder').classList.add('hidden');
  } else if (all.logoData === '') {
    state.logoData = '';
    $('logoPreview').src = '';
    $('logoPreview').classList.add('hidden');
    $('logoPlaceholder').classList.remove('hidden');
  }

  ['year','runtime','quality','cast','genres','features'].forEach(id => $(id).dispatchEvent(new Event('input')));
  $('synopsis').dispatchEvent(new Event('input'));
  $('tagline').dispatchEvent(new Event('input'));
  updateBadges();
  $('darkLayer').style.background = `rgba(0,0,0,${state.overlay/100})`;
  $('logoPreview').style.width = `${state.logoSize}%`;
  updateBg();
  applyRatio($('ratio').value);
}

function loadPresetMap(){
  try {
    return JSON.parse(localStorage.getItem(PRESET_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePresetMap(map){
  localStorage.setItem(PRESET_KEY, JSON.stringify(map));
}

function refreshPresetOptions(selected=''){
  const select = $('presetSelect');
  const presets = loadPresetMap();
  select.innerHTML = '<option value="">프리셋 선택</option>';
  Object.keys(presets).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === selected) opt.selected = true;
    select.appendChild(opt);
  });
}

$('savePresetBtn').addEventListener('click', () => {
  const name = $('presetName').value.trim() || prompt('프리셋 이름을 입력해줘.');
  if (!name) return;

  const presets = loadPresetMap();
  const payload = collectFormData();

  try {
    presets[name] = payload;
    savePresetMap(presets);
    refreshPresetOptions(name);
    $('presetName').value = name;
    alert(`"${name}" 프리셋 저장 완료!`);
  } catch (err) {
    try {
      presets[name] = {...payload, bgData:'', logoData:''};
      savePresetMap(presets);
      refreshPresetOptions(name);
      $('presetName').value = name;
      alert('이미지 용량이 커서 텍스트/설정만 저장했어.');
    } catch (err2) {
      console.error(err2);
      alert('프리셋 저장에 실패했어. 다른 프리셋을 지우거나 이미지 없이 저장해줘.');
    }
  }
});

$('loadPresetBtn').addEventListener('click', () => {
  const name = $('presetSelect').value;
  if (!name) {
    alert('불러올 프리셋을 먼저 선택해줘.');
    return;
  }
  const presets = loadPresetMap();
  if (!presets[name]) return;
  applyFormData(presets[name]);
  $('presetName').value = name;
});

$('deletePresetBtn').addEventListener('click', () => {
  const name = $('presetSelect').value || $('presetName').value.trim();
  if (!name) {
    alert('삭제할 프리셋 이름을 선택해줘.');
    return;
  }
  const presets = loadPresetMap();
  if (!presets[name]) {
    alert('해당 이름의 프리셋이 없어.');
    return;
  }
  if (!confirm(`"${name}" 프리셋을 삭제할까?`)) return;
  delete presets[name];
  savePresetMap(presets);
  refreshPresetOptions();
  $('presetName').value = '';
});

$('presetSelect').addEventListener('change', () => {
  if ($('presetSelect').value) $('presetName').value = $('presetSelect').value;
});

$('resetBtn').addEventListener('click', () => {
  Object.entries(defaults).forEach(([k,v]) => { if($(k)) $(k).value = v; });
  $('filename').value = 'streaming-card';
  $('ratio').value = '1200x900';
  $('bgX').value = 50; $('bgY').value = 50; $('bgZoom').value = 100; $('overlay').value = 52; $('blur').value = 0; $('logoSize').value = 42;
  state.bgX=50; state.bgY=50; state.bgZoom=100; state.overlay=52; state.blur=0; state.logoSize=42; state.ratio='1200x900';
  state.bgData = '';
  state.logoData = '';
  $('bgLayer').style.backgroundImage = 'linear-gradient(135deg,#24282e,#777)';
  $('bgUpload').value='';
  $('logoUpload').value='';
  $('logoPreview').src=''; $('logoPreview').classList.add('hidden'); $('logoPlaceholder').classList.remove('hidden');
  updateBg(); $('darkLayer').style.background='rgba(0,0,0,.52)'; $('logoPreview').style.width='42%';
  ['year','runtime','quality','cast','genres','features'].forEach(id => $(id).dispatchEvent(new Event('input')));
  $('synopsis').dispatchEvent(new Event('input')); $('tagline').dispatchEvent(new Event('input'));
  updateBadges();
  applyRatio(state.ratio);
});

$('exportBtn').addEventListener('click', async () => {
  if (!window.html2canvas) {
    alert('PNG 변환 라이브러리를 불러오지 못했어. 인터넷 연결을 확인해줘.');
    return;
  }
  const btn = $('exportBtn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = '이미지 만드는 중…';

  const card = $('captureCard');
  const prevTransform = card.style.transform;
  const prevMargin = card.style.margin;
  card.style.transform = 'none';
  card.style.margin = '0';

  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#111',
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    const a = document.createElement('a');
    const safeName = ($('filename').value || 'streaming-card').trim().replace(/[\\/:*?"<>|]+/g,'_');
    a.download = `${safeName}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch (err) {
    console.error(err);
    alert('PNG 저장 중 오류가 났어. 다른 이미지로 다시 시도해줘.');
  } finally {
    card.style.transform = prevTransform;
    card.style.margin = prevMargin;
    btn.disabled = false;
    btn.textContent = original;
  }
});

refreshPresetOptions();
applyRatio(state.ratio);
setTimeout(fitPreview, 50);
