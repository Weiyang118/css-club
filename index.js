let detail = null;

// 搜索功能
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.component-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.component-title').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.component-tag')).map(tag => tag.textContent.toLowerCase());
        const category = card.getAttribute('data-category').toLowerCase();
        
        const matches = title.includes(searchTerm) || 
                        tags.some(tag => tag.includes(searchTerm)) || 
                        category.includes(searchTerm);
        
        card.style.display = matches ? 'block' : 'none';
    });
});

// 侧边栏导航
document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 更新激活状态
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // 显示网格视图
        showComponentGrid();
        
        // 过滤组件
        const category = this.getAttribute('data-category');
        const cards = document.querySelectorAll('.component-card');
        
        cards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                const cardCategories = card.getAttribute('data-category').split(' ');
                card.style.display = cardCategories.includes(category) ? 'block' : 'none';
            }
        });
        
        // 清空搜索
        document.getElementById('searchInput').value = '';
        
        // 移动端关闭侧边栏
        if (window.innerWidth < 992) {
            document.getElementById('sidebar').classList.remove('show');
        }
    });
});

async function getComponentDetails(key) {
    try {
        const response = await fetch('./data/componentDetails.json');
        if (!response.ok) {
            throw new Error('网络响应失败');
        }
        const data = await response.json();

        if (data[key]) {
            return data[key];
        } else {
            throw new Error(`未找到 key: ${key}`);
        }
    } catch (error) {
        console.error('获取组件详情失败:', error);
        return null;
    }
}
// 显示组件详情
async function showComponentDetail(componentId) {
    document.getElementById('componentDetail').innerHTML = '';
    detail = await getComponentDetails(componentId);
    console.log('组件详情:', detail);
    if (!detail) return;

    const codeLanguages = detail.code ? Object.keys(detail.code) : [];

    const codeButtons = codeLanguages.map(lang => {
        const langName = lang.toUpperCase();
        return `<button class="code-title" onclick="changeCodeLanguage('${lang}')">${langName}</button>`;
    }).join('');

    const detailHTML = `
        <div class="detail-header">
            <div class="detail-header-content">
                <button class="back-btn mb-3" onclick="showComponentGrid()">
                    <i class="fas fa-arrow-left me-2"></i>Back to Components
                </button>
                <h1 class="detail-title">
                    <i class="${detail.icon}"></i>
                    ${detail.title}
                </h1>
            </div>
        </div>

        <div class="detail-content">
            <div class="demo-section">
                <h2 class="section-title">
                    <i class="fas fa-eye"></i>
                    Show Area
                </h2>
                <div class="demo-area d-flex justify-content-center align-items-center">
                    <iframe src="${detail.demo}" frameborder="0" class="demo-iframe" style="width: 100%; height:auto; border-radius: 15px;">
                    </iframe>
                </div>
            </div>

            <div class="code-section">
                <h2 class="section-title">
                    <i class="fas fa-code"></i>
                    Code Example
                </h2>
                <div class="code-block">
                    <div class="code-header d-flex justify-content-between align-items-center">
                        <div> 
                            ${codeButtons}
                        </div>
                        <button class="copy-btn" onclick="copyCode(this)">
                            <i class="fas fa-copy me-1"></i>Copy
                        </button>
                    </div>
                    <pre id="code-language"><code class="language-html coding">${detail.code.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            </div>
        </div>
    `;

    document.getElementById('componentDetail').innerHTML = detailHTML;
    document.getElementById('componentsGrid').style.display = 'none';
    document.getElementById('componentDetail').classList.add('active');

    // 重新高亮代码
    if (window.Prism) {
        Prism.highlightAll();
    }
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changeCodeLanguage(language) {
    const codeBlock = document.querySelector('#code-language');
    if (language === 'html') {
        codeBlock.innerHTML = `<code class="language-html coding">${detail.code.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    } else if (language === 'css') {
        codeBlock.innerHTML = `<code class="language-css coding">${detail.code.css.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    } else if (language === 'js') {
        codeBlock.innerHTML = `<code class="language-javascript coding">${detail.code.js.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    }
    
    // 重新高亮代码
    if (window.Prism) {
        Prism.highlightAll();
    }

    document.querySelector('.copy-btn').textContent = 'Copy';
    document.querySelector('.copy-btn').style.background = '';
}


// 显示组件网格
function showComponentGrid() {
    const oldScript = document.getElementById('demo-script');
    if (oldScript) oldScript.remove();
    document.getElementById('componentsGrid').style.display = 'grid';
    document.getElementById('componentDetail').classList.remove('active');
}

// 复制代码功能
function copyCode(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    });
}

// 移动端侧边栏切换
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// 点击主内容区域关闭移动端侧边栏
document.querySelector('.main-content').addEventListener('click', function() {
    if (window.innerWidth < 992) {
        document.getElementById('sidebar').classList.remove('show');
    }
});

// 阻止侧边栏内的点击事件冒泡
document.getElementById('sidebar').addEventListener('click', function(e) {
    e.stopPropagation();
});

async function loadComponents() {
    try {
      const response = await fetch('./data/component.json'); // 或者 '/data/components.json'
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      document.querySelector('#componentsGrid').innerHTML = '';

      // 渲染每个组件（示例）
      data.components.forEach(component => {
        renderComponentCard(component);
      });
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  }

  function renderComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.setAttribute('data-category', component.categories.join(' '));
    card.setAttribute('onclick', `showComponentDetail('${component.id}')`);
    
    card.innerHTML = `
      <div class="component-title">
        <div class="component-title-left">
          <i class="${component.icon}"></i>
          ${component.name}
        </div>
        <span class="component-status">${component.status}</span>
      </div>
      <div class="component-demo">
        <img src="${component.screenshot}" alt="">
      </div>
      <div class="component-tags">
        ${component.tags.map(tag => `<span class="component-tag">${tag}</span>`).join('')}
      </div>
      <div class="component-meta">
        <span><i class="fas fa-eye"></i> ${component.meta.views} Views</span>
        <span><i class="fas fa-heart"></i> ${component.meta.likes} Likes</span>
      </div>
    `;

    document.querySelector('#componentsGrid').appendChild(card);
  }

  // 在页面加载完成后执行
  window.addEventListener('DOMContentLoaded', loadComponents);