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
        menuEl.null;
      }
  
      // 메뉴 컨테이너
      menuEl = document.createElement('div');
      Object.assign(menuEl.style, {
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
        background: 'white',
        border: '1px solid #ccc',
        padding: '4px',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 2147483647,
        display: 'flex',
        gap: '4px'
      });
  
      // 각 태그 버튼 만들기
      tags.forEach((tag) => {
        const btn = document.createElement('button');
        btn.textContent = tag.name;
        Object.assign(btn.style, {
          padding: '2px 6px',
          fontSize: '12px',
          cursor: 'pointer'
        });
  
  
        btn.addEventListener('click', async () => {
          console.log('클립 저장 시도');  // 이 로그가 찍히는지 확인
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
            if (!saveRes.ok) throw new Error(res.statusText);
            const newClip = await saveRes.json();
            console.log('저장 성공');

            chrome.runtime.sendMessage({
                type: 'CLIP_SAVED',
                projectId: selectedProjectId,
                clip: newClip
            })
          } catch (err) {
            console.error('Failed to save clip', err);
          }
        menuEl.remove();
        menuEl = null;
          
        });

        menuEl.appendChild(btn);
      });
  
      document.body.appendChild(menuEl);
    });
  })();