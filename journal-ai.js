(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'journal-ai-dialog';
  dialog.setAttribute('aria-labelledby', 'journal-ai-title');
  dialog.innerHTML = `
    <form method="dialog"><h2 id="journal-ai-title">AI에게 물어보기</h2><button>닫기</button></form>
    <p class="journal-ai-case"></p>
    <label for="journal-ai-question">어떤 부분이 궁금한가요?</label>
    <textarea id="journal-ai-question" rows="3" placeholder="예: 두 번째 해에 차변 계정이 바뀌는 이유가 궁금해요."></textarea>
    <details><summary>함께 복사할 문제 보기</summary><pre></pre></details>
    <p>문제와 질문을 복사한 뒤, 사용할 AI를 열어 붙여넣으세요.</p>
    <button type="button" class="journal-ai-copy">문제와 질문 복사</button>
    <textarea class="journal-ai-manual" rows="5" aria-label="직접 복사할 문제와 질문" readonly hidden></textarea>
    <p role="status"></p>
    <div class="journal-ai-links">
      <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT 열기 ↗</a>
      <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude 열기 ↗</a>
      <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">Gemini 열기 ↗</a>
    </div>`;
  document.body.append(dialog);
  const label = dialog.querySelector('.journal-ai-case');
  const question = dialog.querySelector('#journal-ai-question');
  const preview = dialog.querySelector('pre');
  const manual = dialog.querySelector('.journal-ai-manual');
  const status = dialog.querySelector('[role="status"]');
  const chapter = document.querySelector('h1').textContent.trim();
  let revision = 0;
  let defaultQuestion;

  function resetCopy() {
    revision++;
    status.textContent = '';
    manual.hidden = true;
    manual.value = '';
  }
  question.addEventListener('input', resetCopy);
  dialog.addEventListener('close', resetCopy);
  dialog.querySelector('.journal-ai-copy').addEventListener('click', async () => {
    const current = revision;
    const request = question.value.trim() || defaultQuestion;
    const text = ['회계 분개노트 · ' + label.textContent, preview.textContent, '내 질문\n' + request].join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      if (current === revision) status.textContent = '복사했습니다. 원하는 AI를 열어 붙여넣으세요.';
    } catch {
      if (current !== revision) return;
      manual.value = text;
      manual.hidden = false;
      manual.focus();
      manual.select();
      status.textContent = '선택된 내용을 직접 복사한 뒤 AI에 붙여넣으세요.';
    }
  });

  function addQuestionButton(prompt, recall) {
    const section = prompt.closest('section');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'journal-ai-ask';
    button.textContent = recall ? '회상 문제 AI에게 물어보기' : 'AI에게 물어보기';
    button.setAttribute('aria-haspopup', 'dialog');
    const anchor = recall || prompt;
    anchor.after(button);
    button.addEventListener('click', () => {
      label.textContent = [chapter, section.querySelector('.num').textContent, section.querySelector('h2').textContent].join(' · ');
      const conditions = prompt.innerText.trim();
      if (recall) {
        defaultQuestion = '위 회상 문제에 답하고, 사례에서 그 판단의 근거가 되는 조건을 짚어 주세요.';
        label.textContent += ' · 회상 문제';
        const recallQuestion = recall.querySelector('summary').textContent.trim();
        preview.textContent = recallQuestion + '\n\n참고할 사례 조건\n' + conditions;
      } else {
        defaultQuestion = '문제의 조건을 어떤 순서로 판단하는지 설명하고, 필요한 계산과 차변·대변의 근거를 보여주세요.';
        preview.textContent = conditions;
      }
      question.value = '';
      dialog.querySelector('details').open = false;
      resetCopy();
      dialog.showModal();
    });
  }

  for (const prompt of document.querySelectorAll('section .prompt')) {
    addQuestionButton(prompt);
    const recall = prompt.closest('section').querySelector('details.recall');
    if (recall) addQuestionButton(prompt, recall);
  }
})();
