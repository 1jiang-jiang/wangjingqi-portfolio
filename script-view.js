const scriptParams = new URLSearchParams(window.location.search);
const scriptProject = window.PROJECTS.find((item) => item.slug === scriptParams.get('project'));
const scriptDocument = scriptProject && window.SCRIPT_DOCS[scriptProject.slug];
const scriptRoot = document.querySelector('#script-page');
const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const lineBreaks = (value) => escapeHtml(value).replace(/\n/g, '<br>');

function renderTable(table) {
  const [head, ...rows] = table;
  return `<div class="script-table-wrap"><table class="script-table"><thead><tr>${head.map((cell) => `<th>${lineBreaks(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${lineBreaks(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

if (!scriptProject || !scriptDocument) {
  scriptRoot.innerHTML = '<section class="empty"><p class="eyebrow">SCRIPT NOT FOUND</p><h1>未找到这个项目脚本</h1><a class="button dark" href="./index.html">返回作品集</a></section>';
} else {
  document.title = `${scriptProject.title}｜脚本｜王京琪作品集`;
  document.querySelector('#script-back').href = `./project.html?project=${scriptProject.slug}#script`;
  const tables = [...scriptDocument.tables];
  const mainTableIndex = tables.length ? tables.reduce((largestIndex, table, index) => table.length > tables[largestIndex].length ? index : largestIndex, 0) : -1;
  const mainTable = mainTableIndex >= 0 ? tables.splice(mainTableIndex, 1)[0] : null;
  const textContent = scriptDocument.paragraphs.map((paragraph) => `<p>${lineBreaks(paragraph)}</p>`).join('');
  const extraTables = tables.length ? `<details class="script-details"><summary>补充信息 <span>${tables.length} 份</span></summary>${tables.map(renderTable).join('')}</details>` : '';
  scriptRoot.innerHTML = `<section class="script-hero"><p class="eyebrow">SCRIPT / STORYBOARD</p><h1>${scriptProject.title}</h1><p>${scriptProject.type}${scriptProject.duration ? ` · ${scriptProject.duration}` : ''}</p><span>根据提供的《${escapeHtml(scriptDocument.source)}》整理</span></section><section class="script-lead"><div><p class="eyebrow">PRIMARY SCRIPT</p><h2>分镜脚本</h2><p>按原文保留时间、画面、台词与声音／剪辑信息。横向拖动可查看完整列。</p></div>${mainTable ? renderTable(mainTable) : '<p class="body-copy">该脚本尚未包含表格内容。</p>'}</section><details class="script-details script-text"><summary>完整文字脚本与创作说明 <span>点击展开</span></summary><div>${textContent}</div></details>${extraTables}<div class="script-bottom"><a class="button dark" href="./project.html?project=${scriptProject.slug}#assets">继续查看人物、场景与分镜 →</a></div>`;
}
