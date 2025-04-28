// Background confetti
const backgroundCanvas = document.getElementById('backgroundConfetti');
const backgroundConfetti = confetti.create(backgroundCanvas, { resize: true, useWorker: true });

setInterval(() => {
  backgroundConfetti({
    particleCount: 2,
    spread: 80,
    startVelocity: 20,
    decay: 0.9,
    colors: ['#bb0000', '#ffffff', '#00bb00'],
    origin: {
      x: Math.random(),
      y: Math.random() - 0.2
    }
  });
}, 400);

// Resume analysis logic
let resumeText = "";

function analyzeResume() {
  const fileInput = document.getElementById('resumeUpload');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a file first!");
    return;
  }

  const type = file.name.split('.').pop().toLowerCase();
  if (type === 'txt') {
    const reader = new FileReader();
    reader.onload = e => {
      resumeText = e.target.result;
      performAnalysis();
    };
    reader.readAsText(file);
  } else if (type === 'pdf') {
    const reader = new FileReader();
    reader.onload = e => {
      const typedArray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
        pdf.getPage(1).then(page => {
          page.getTextContent().then(textContent => {
            resumeText = textContent.items.map(item => item.str).join(" ");
            performAnalysis();
          });
        });
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Only .txt or .pdf files are allowed.");
  }
}

function performAnalysis() {
  document.getElementById('progressContainer').classList.remove('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').innerText = "Analyzing...";

  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 100) {
      progress += 10;
      document.getElementById('progressFill').style.width = progress + '%';
    } else {
      clearInterval(interval);
      showResults();
    }
  }, 500);
}

function showResults() {
  document.getElementById('progressContainer').classList.add('hidden');
  document.getElementById('resultContainer').classList.remove('hidden');

  const score = (Math.random() * 100).toFixed(2);
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('tips').innerHTML = `
    <ul>
      <li>Consider using more action verbs.</li>
      <li>Include specific accomplishments.</li>
    </ul>
  `;

  document.getElementById('successAnimation').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('successAnimation').classList.add('hidden');
  }, 2000);
}

// File upload interactions
const fileInput = document.getElementById('resumeUpload');
const uploadLabel = document.getElementById('uploadLabel');
const uploadText = document.getElementById('uploadText');
const fileNameList = document.getElementById('fileNameList');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    appendFileName(file.name);
    uploadLabel.classList.add('file-selected');
  }
});

uploadLabel.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadLabel.classList.add('drag-over');
});

uploadLabel.addEventListener('dragleave', () => {
  uploadLabel.classList.remove('drag-over');
});

uploadLabel.addEventListener('drop', (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    fileInput.files = event.dataTransfer.files;
    appendFileName(file.name);
    uploadLabel.classList.add('file-selected');
  }
});

function appendFileName(name) {
  const li = document.createElement('li');
  li.textContent = name;
  fileNameList.appendChild(li);
}
