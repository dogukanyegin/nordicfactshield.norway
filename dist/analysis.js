
        // Copy to clipboard
        function copyText(id) {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.innerText).then(() => {
                const btns = document.querySelectorAll('button[data-click="copyText(\'' + id + '\')"]');
                btns.forEach(b => { b.innerText = 'KOPIERT ✓'; setTimeout(() => b.innerText = 'KOPIER', 2000); });
            });
        }

        function toggleAcc(id) {
            const body = document.getElementById(id);
            const icon = document.getElementById(id + '-icon');
            const isOpen = body.classList.contains('expanded');
            if (isOpen) {
                body.classList.remove('expanded');
                body.classList.add('collapsed');
                body.style.maxHeight = '0';
                icon.classList.remove('open');
            } else {
                body.classList.remove('collapsed');
                body.classList.add('expanded');
                body.style.maxHeight = body.scrollHeight + 'px';
                icon.classList.add('open');
            }
        }
 
        // Language tab switcher
        function showLang(lang) {
            ['tr','en','no','sv'].forEach(l => {
                document.getElementById('panel-' + l).classList.remove('active');
                document.getElementById('tab-' + l).classList.remove('active-tab');
            });
            document.getElementById('panel-' + lang).classList.add('active');
            document.getElementById('tab-' + lang).classList.add('active-tab');
        }
 
        // Smooth scroll for TOC links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    
document.querySelectorAll('[data-click]').forEach(el=>{const action=el.dataset.click; const match=/^(toggleAcc|showLang|copyText)\('([a-z0-9-]+)'\)$/.exec(action); const run=()=>{if(match)({toggleAcc,showLang,copyText})[match[1]](match[2]);else if(action==="window.location.href='/'")location.assign('./');};el.addEventListener('click',run);if(el.tagName!=='BUTTON'){el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});}});
