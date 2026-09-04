const $ = (id) => document.getElementById(id);

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
  recommend: '시청자 추천',
  synopsis: '창의력이 지글지글 끓어오르는 셰프. 똑같은 메뉴만 고집하는 주인과 지지고 볶은 후 허름한 푸드트럭을 차리면서 맛깔나는 좌충우돌 여정에 오른다. 배고플 땐 보지 말 것!',
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

['year','runtime','quality','recommend','cast','genres','features'].forEach(id => setText(id, id + 'Out'));

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

$('resetBtn').addEventListener('click', () => {
  Object.entries(defaults).forEach(([k,v]) => { if($(k)) $(k).value = v; });
  $('bgX').value = 50; $('bgY').value = 50; $('bgZoom').value = 100; $('overlay').value = 52; $('blur').value = 0; $('logoSize').value = 42;
  state.bgX=50; state.bgY=50; state.bgZoom=100; state.overlay=52; state.blur=0; state.logoSize=42;
  $('bgLayer').style.backgroundImage = 'linear-gradient(135deg,#24282e,#777)';
  $('bgUpload').value='';
  $('logoUpload').value='';
  $('logoPreview').src=''; $('logoPreview').classList.add('hidden'); $('logoPlaceholder').classList.remove('hidden');
  updateBg(); $('darkLayer').style.background='rgba(0,0,0,.52)'; $('logoPreview').style.width='42%';
  ['year','runtime','quality','recommend','cast','genres','features'].forEach(id => $(id).dispatchEvent(new Event('input')));
  $('synopsis').dispatchEvent(new Event('input')); $('tagline').dispatchEvent(new Event('input'));
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

applyRatio(state.ratio);
setTimeout(fitPreview, 50);
