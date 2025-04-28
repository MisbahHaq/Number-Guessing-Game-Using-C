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
  }, 300);
}

function showResults() {
  document.getElementById('progressContainer').classList.add('hidden');
  document.getElementById('resultContainer').classList.remove('hidden');

  const { score, tips } = analyzeContent(resumeText);

  document.getElementById('score').innerText = `Score: ${score.toFixed(1)}`;
  document.getElementById('tips').innerHTML = tips.length
    ? "<ul>" + tips.map(t => `<li>${t}</li>`).join("") + "</ul>"
    : "<p>Great job! Your resume is well optimized.</p>";

  document.getElementById('successAnimation').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('successAnimation').classList.add('hidden');
  }, 2000);
}

function analyzeContent(text) {
  let score = 0;
  const tips = [];

  const sections = ["education", "experience", "skills", "certifications"];
  sections.forEach(section => {
    if (text.toLowerCase().includes(section)) {
      score += 5;
    } else {
      tips.push(`Missing section: ${section}`);
    }
  });

  const keywords = ["team", "project", "python", "managed", "designed"];
  const foundKeywords = keywords.filter(word => text.toLowerCase().includes(word));
  score += foundKeywords.length * 2;

  const actionVerbs = ["led", "developed", "increased", "improved"];
  const foundActions = actionVerbs.filter(verb => text.toLowerCase().includes(verb));
  if (foundActions.length === 0) {
    tips.push("Use more action verbs to describe achievements.");
  } else {
    score += foundActions.length * 2;
  }

  const bullets = (text.match(/•|-/g) || []).length;
  if (bullets < 5) {
    tips.push("Use more bullet points for readability.");
  } else {
    score += 5;
  }

  if (text.length > 3000) {
    tips.push("Resume might be too long. Aim for 1–2 pages.");
    score -= 5;
  }

  return {
    score: Math.min(100, score + 50),
    tips
  };
}

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
  fileNameList.innerHTML = ""; // Only keep one name
  const li = document.createElement("li");
  li.textContent = name;
  fileNameList.appendChild(li);
}
