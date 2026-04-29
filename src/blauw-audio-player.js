/**
 * Blauw Audio Player
 * https://github.com/BlauwFilms/blauw-audio-player
 *
 * Auto-renders any element with class="blauw-audio-player" into a fully
 * functional audio player. Supports single tracks and albums.
 *
 * Embed (single track):
 *   <div class="blauw-audio-player"
 *        data-src="https://example.com/track.mp3"
 *        data-title="Track Title"
 *        data-artist="Artist Name"
 *        data-album="Album Name"
 *        data-cover="https://example.com/cover.jpg"></div>
 *
 * Embed (album):
 *   <div class="blauw-audio-player"
 *        data-album="Album Name"
 *        data-artist="Default Artist"
 *        data-cover="https://example.com/cover.jpg"
 *        data-tracks='[
 *          {"src":"https://example.com/01.mp3","title":"Track 1"},
 *          {"src":"https://example.com/02.mp3","title":"Track 2","artist":"Different Artist"}
 *        ]'></div>
 *
 * Per-track artist overrides player-level data-artist.
 * Any missing field is hidden — layout adapts.
 *
 * Customize colors via CSS variables (see blauw-audio-player.css).
 *
 * For dynamically inserted players, call window.BlauwAudioPlayer.init().
 *
 * License: MIT
 */
(function () {
  'use strict';

  // SVG icons (defined once, reused)
  var ICONS = {
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    back10: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/><text x="12" y="15" font-size="7" fill="currentColor" stroke="none" text-anchor="middle">10</text></svg>',
    fwd10: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/><text x="12" y="15" font-size="7" fill="currentColor" stroke="none" text-anchor="middle">10</text></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
  };

  function fmt(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), x = Math.floor(s % 60);
    return m + ':' + (x < 10 ? '0' : '') + x;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function parseTracks(el) {
    if (el.dataset.src) {
      return [{
        src: el.dataset.src,
        title: el.dataset.title || 'Untitled',
        artist: el.dataset.artist || ''
      }];
    }
    if (el.dataset.tracks) {
      try {
        var arr = JSON.parse(el.dataset.tracks);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr.map(function (t) {
            return {
              src: t.src || '',
              title: t.title || 'Untitled',
              artist: t.artist || ''
            };
          });
        }
      } catch (e) {
        console.error('Blauw Audio Player: invalid data-tracks JSON', e);
      }
    }
    return [];
  }

  function buildPlayer(el) {
    var tracks = parseTracks(el);
    if (!tracks.length) {
      el.innerHTML = '<div class="bap-error">Audio player: no tracks specified. Check data-src or data-tracks attribute.</div>';
      return;
    }

    var playerArtist = el.dataset.artist || '';
    var albumTitle = el.dataset.album || '';
    var coverUrl = el.dataset.cover || '';
    var isAlbum = tracks.length > 1;

    var coverHtml = coverUrl
      ? '<img src="' + escapeHtml(coverUrl) + '" alt="">'
      : ICONS.music;

    var prevBtnHtml = isAlbum
      ? '<button class="bap-btn bap-prev" aria-label="Previous track">' + ICONS.prev + '</button>'
      : '';
    var nextBtnHtml = isAlbum
      ? '<button class="bap-btn bap-next" aria-label="Next track">' + ICONS.next + '</button>'
      : '';
    var trackListHtml = isAlbum ? '<div class="bap-tracks"></div>' : '';

    el.innerHTML =
      '<div class="bap-inner">' +
        '<div class="bap-cover">' + coverHtml + '</div>' +
        '<div class="bap-content">' +
          '<span class="bap-title"></span>' +
          '<span class="bap-meta"></span>' +
          '<div class="bap-bar"><div class="bap-progress"></div></div>' +
          '<div class="bap-times"><span class="bap-cur">0:00</span><span class="bap-tot">0:00</span></div>' +
          '<div class="bap-controls">' +
            prevBtnHtml +
            '<button class="bap-btn bap-back" aria-label="Skip back 10 seconds">' + ICONS.back10 + '</button>' +
            '<button class="bap-btn bap-play" aria-label="Play"><span class="bap-play-icon">' + ICONS.play + '</span><span class="bap-pause-icon" style="display:none">' + ICONS.pause + '</span></button>' +
            '<button class="bap-btn bap-fwd" aria-label="Skip forward 10 seconds">' + ICONS.fwd10 + '</button>' +
            nextBtnHtml +
            '<div class="bap-volume">' +
              '<button class="bap-btn bap-vol-btn" aria-label="Mute"><span class="bap-vol-icon">' + ICONS.vol + '</span><span class="bap-mute-icon" style="display:none">' + ICONS.mute + '</span></button>' +
              '<input type="range" class="bap-vol-slider" min="0" max="100" value="80" aria-label="Volume">' +
            '</div>' +
          '</div>' +
          trackListHtml +
        '</div>' +
      '</div>';

    // State
    var ci = 0;
    var lastVolume = 0.8;
    var audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = lastVolume;

    // Element refs
    var titleEl = el.querySelector('.bap-title');
    var metaEl = el.querySelector('.bap-meta');
    var curEl = el.querySelector('.bap-cur');
    var totEl = el.querySelector('.bap-tot');
    var progressEl = el.querySelector('.bap-progress');
    var barEl = el.querySelector('.bap-bar');
    var playBtn = el.querySelector('.bap-play');
    var playIcon = el.querySelector('.bap-play-icon');
    var pauseIcon = el.querySelector('.bap-pause-icon');
    var backBtn = el.querySelector('.bap-back');
    var fwdBtn = el.querySelector('.bap-fwd');
    var prevBtn = el.querySelector('.bap-prev');
    var nextBtn = el.querySelector('.bap-next');
    var volBtn = el.querySelector('.bap-vol-btn');
    var volIcon = el.querySelector('.bap-vol-icon');
    var muteIcon = el.querySelector('.bap-mute-icon');
    var volSlider = el.querySelector('.bap-vol-slider');
    var tracksEl = el.querySelector('.bap-tracks');

    function buildMetaLine(track) {
      // Track artist takes precedence; falls back to player-level artist
      var artist = (track.artist && track.artist.trim()) || playerArtist;
      var parts = [];
      if (artist) parts.push(artist);
      if (albumTitle) parts.push(albumTitle);
      return parts.join(' · ');
    }

    function loadTrack(idx) {
      ci = idx;
      var t = tracks[ci];
      audio.src = t.src;
      titleEl.textContent = t.title;
      var meta = buildMetaLine(t);
      metaEl.textContent = meta;
      titleEl.classList.toggle('bap-no-meta', !meta);
      progressEl.style.width = '0%';
      curEl.textContent = '0:00';
      totEl.textContent = '0:00';
      renderTrackList();
      updateNav();
    }

    function renderTrackList() {
      if (!tracksEl) return;
      tracksEl.innerHTML = '';
      tracks.forEach(function (t, i) {
        var d = document.createElement('div');
        d.className = 'bap-track' + (i === ci ? ' bap-active' : '');
        d.innerHTML =
          '<span class="bap-track-num">' + (i + 1) + '</span>' +
          '<span class="bap-track-name"></span>' +
          '<span class="bap-track-dur">' + (t._duration ? fmt(t._duration) : '—') + '</span>';
        d.querySelector('.bap-track-name').textContent = t.title;
        d.onclick = function () { loadTrack(i); audio.play(); };
        tracksEl.appendChild(d);
      });
    }

    function updateNav() {
      if (prevBtn) prevBtn.disabled = ci === 0;
      if (nextBtn) nextBtn.disabled = ci >= tracks.length - 1;
    }

    // Pre-fetch durations for album tracks
    if (isAlbum) {
      tracks.forEach(function (t, i) {
        var probe = new Audio();
        probe.preload = 'metadata';
        probe.src = t.src;
        probe.onloadedmetadata = function () {
          t._duration = probe.duration;
          if (i === ci) totEl.textContent = fmt(probe.duration);
          renderTrackList();
        };
      });
    }

    // Event handlers
    playBtn.onclick = function () { audio.paused ? audio.play() : audio.pause(); };
    backBtn.onclick = function () { audio.currentTime = Math.max(0, audio.currentTime - 10); };
    fwdBtn.onclick = function () { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); };
    if (prevBtn) prevBtn.onclick = function () { if (ci > 0) { loadTrack(ci - 1); audio.play(); } };
    if (nextBtn) nextBtn.onclick = function () { if (ci < tracks.length - 1) { loadTrack(ci + 1); audio.play(); } };

    volBtn.onclick = function () {
      if (audio.volume === 0) {
        audio.volume = lastVolume || 0.8;
        volSlider.value = audio.volume * 100;
        muteIcon.style.display = 'none';
        volIcon.style.display = 'block';
      } else {
        lastVolume = audio.volume;
        audio.volume = 0;
        volSlider.value = 0;
        muteIcon.style.display = 'block';
        volIcon.style.display = 'none';
      }
    };
    volSlider.oninput = function () {
      var v = this.value / 100;
      audio.volume = v;
      if (v > 0) lastVolume = v;
      muteIcon.style.display = v === 0 ? 'block' : 'none';
      volIcon.style.display = v === 0 ? 'none' : 'block';
    };

    barEl.onclick = function (e) {
      var r = barEl.getBoundingClientRect();
      var pct = (e.clientX - r.left) / r.width;
      audio.currentTime = pct * (audio.duration || 0);
    };

    audio.addEventListener('loadedmetadata', function () {
      totEl.textContent = fmt(audio.duration);
      tracks[ci]._duration = audio.duration;
      if (tracksEl) renderTrackList();
    });
    audio.addEventListener('play', function () {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    });
    audio.addEventListener('pause', function () {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    });
    audio.addEventListener('timeupdate', function () {
      var pct = audio.currentTime / (audio.duration || 1) * 100;
      progressEl.style.width = pct + '%';
      curEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', function () {
      if (ci < tracks.length - 1) {
        loadTrack(ci + 1);
        audio.play();
      } else {
        progressEl.style.width = '0%';
        curEl.textContent = '0:00';
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });
    audio.addEventListener('error', function () {
      titleEl.textContent = 'Audio unavailable';
    });

    el.dataset.bapInit = '1';
    loadTrack(0);
  }

  function initAll() {
    var els = document.querySelectorAll('.blauw-audio-player:not([data-bap-init])');
    for (var i = 0; i < els.length; i++) {
      buildPlayer(els[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.BlauwAudioPlayer = { init: initAll };
})();
