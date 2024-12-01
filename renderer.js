document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const addresses = document.getElementById('addresses').value.split(',').map(addr => addr.trim());
  const maxRepeats = parseInt(document.getElementById('maxRepeats').value);

  document.getElementById('progress').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 1, 99);
    document.getElementById('progressBar').style.width = `${progress}%`;
  }, 1000);

  try {
    const results = await window.electronAPI.startSearch({
      searchRange: { start, end },
      addresses,
      maxConsecutiveRepeats: maxRepeats
    });

    clearInterval(progressInterval);
    document.getElementById('progressBar').style.width = '100%';

    const resultList = document.getElementById('resultList');
    resultList.innerHTML = '';
    results.forEach(result => {
      const li = document.createElement('li');
      li.textContent = result;
      resultList.appendChild(li);
    });

    document.getElementById('results').classList.remove('hidden');
  } catch (error) {
    clearInterval(progressInterval);
    document.getElementById('error').textContent = `Error: ${error.message}`;
    document.getElementById('error').classList.remove('hidden');
  } finally {
    document.getElementById('progress').classList.add('hidden');
  }
});

