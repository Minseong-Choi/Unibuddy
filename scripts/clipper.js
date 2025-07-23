// scripts/clipper.js

(async function() {
  const API = 'http://localhost:4000';

  let menuEl = null;

  // 페이지 어디든 클릭하면 메뉴 제거
  document.addEventListener('mousedown', (e) => {
      // 메뉴가 떠 있고, 클릭한 요소가 menuEl 바깥이면 제거
      if (menuEl && !menuEl.contains(e.target)) {
        menuEl.remove();
        menuEl = null;
      }
    });

  document.addEventListener('mouseup', async (e) => {

    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text) return;

    // 현재 선택 영역 위치 계산
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.right + window.scrollX;
    const y = rect.bottom + window.scrollY;

    // 저장해 둔 projectId, jwt 꺼내오기
    const { clipperEnabled, selectedProjectId, jwt } = await chrome.storage.local.get(
      ['clipperEnabled','selectedProjectId', 'jwt']
    );
    if (!clipperEnabled || !selectedProjectId || !jwt) {
      console.warn('No project selected or not logged in');
      return;
    }

    // 해당 프로젝트의 태그 목록 불러오기
    let tags;
    try {
      const res = await fetch(
        `${API}/projects/${selectedProjectId}/tags`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      tags = await res.json();
    } catch (err) {
      console.error('Failed to load tags', err);
      return;
    }
    if(menuEl){
      menuEl.remove();
      menuEl = null;
    }

    // 메뉴 컨테이너 - 최소 크기로 컴팩트하게
    menuEl = document.createElement('div');
    Object.assign(menuEl.style, {
      position: 'absolute',
      top: `${y + 2}px`,
      left: `${x + 2}px`,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      padding: '4px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 2147483647,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '3px',
      maxWidth: '200px',
      fontSize: '10px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });

    // 헤더 제거 - 공간 절약

    // 태그 컨테이너
    const tagContainer = document.createElement('div');
    Object.assign(tagContainer.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px',
      width: '100%'
    });

    // 각 태그 버튼 만들기 - 미니 사이즈
    tags.forEach((tag) => {
      const btn = document.createElement('button');
      btn.textContent = tag.name;
      
      Object.assign(btn.style, {
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        border: 'none',
        borderRadius: '10px',
        padding: '3px 6px',
        fontSize: '10px',
        fontWeight: '600',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 4px rgba(59, 130, 246, 0.3)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: '1'
      });

      // 호버 효과 - 더 작게
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px) scale(1.03)';
        btn.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.4)';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
        btn.style.boxShadow = '0 1px 4px rgba(59, 130, 246, 0.3)';
      });

      // 클릭 효과
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'translateY(0) scale(0.97)';
      });

      btn.addEventListener('click', async () => {
        console.log('클립 저장 시도');
        
        // 로딩 상태 표시
        const originalText = btn.textContent;
        btn.textContent = '💾';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
        
        try {
          const saveRes = await fetch(
            `${API}/projects/${selectedProjectId}/clips`,
            {
              method: 'POST',                                   
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`               
              },
              body: JSON.stringify({                             
                  tag:     tag.name,
                  url:     window.location.href,
                  content: text,
              }),
            }
          );
          if (!saveRes.ok) throw new Error(saveRes.statusText);
          const newClip = await saveRes.json();
          console.log('저장 성공');

          // 성공 피드백
          btn.textContent = '✅';
          btn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
          
          setTimeout(() => {
            chrome.runtime.sendMessage({
                type: 'CLIP_SAVED',
                projectId: selectedProjectId,
                clip: newClip
            });
            
            if (menuEl) {
              menuEl.remove();
              menuEl = null;
            }
          }, 600);

        } catch (err) {
          console.error('Failed to save clip', err);
          
          // 에러 피드백
          btn.textContent = '❌';
          btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
          }, 1200);
        }
      });

      tagContainer.appendChild(btn);
    });

    // "태그 없음" 버튼 - 미니 사이즈
    const noTagBtn = document.createElement('button');
    noTagBtn.textContent = '태그없음';
    Object.assign(noTagBtn.style, {
      background: 'rgba(148, 163, 184, 0.8)',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '10px',
      padding: '3px 6px',
      fontSize: '10px',
      fontWeight: '600',
      color: '#475569',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      lineHeight: '1'
    });

    noTagBtn.addEventListener('mouseenter', () => {
      noTagBtn.style.background = 'rgba(148, 163, 184, 1)';
      noTagBtn.style.color = 'white';
      noTagBtn.style.transform = 'translateY(-1px)';
    });

    noTagBtn.addEventListener('mouseleave', () => {
      noTagBtn.style.background = 'rgba(148, 163, 184, 0.8)';
      noTagBtn.style.color = '#475569';
      noTagBtn.style.transform = 'translateY(0)';
    });

    noTagBtn.addEventListener('click', async () => {
      console.log('태그 없이 클립 저장');
      
      const originalText = noTagBtn.textContent;
      noTagBtn.textContent = '💾';
      
      try {
        const saveRes = await fetch(
          `${API}/projects/${selectedProjectId}/clips`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
              url: window.location.href,
              content: text,
            }),
          }
        );
        if (!saveRes.ok) throw new Error(saveRes.statusText);
        const newClip = await saveRes.json();

        noTagBtn.textContent = '✅';
        noTagBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
        noTagBtn.style.color = 'white';

        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: 'CLIP_SAVED',
            projectId: selectedProjectId,
            clip: newClip
          });
          
          if (menuEl) {
            menuEl.remove();
            menuEl = null;
          }
        }, 600);

      } catch (err) {
        console.error('Failed to save clip', err);
        noTagBtn.textContent = '❌';
        noTagBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        noTagBtn.style.color = 'white';
      }
    });

    tagContainer.appendChild(noTagBtn);
    menuEl.appendChild(tagContainer);
    document.body.appendChild(menuEl);
  });
})();