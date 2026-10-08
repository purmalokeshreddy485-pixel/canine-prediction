(() => {
  const dropzone = document.getElementById('dropzone')
  const fileInput = document.getElementById('fileInput')
  const browseBtn = document.getElementById('browseBtn')
  const preview = document.getElementById('preview')
  const previewWrapper = document.getElementById('previewWrapper')
  const predictBtn = document.getElementById('predictBtn')
  const spinner = document.getElementById('spinner')
  const results = document.getElementById('results')
  const resultsList = document.getElementById('resultsList')
  const tryAgain = document.getElementById('tryAgain')

  let selectedFile = null

  function showPreview(file) {
    const reader = new FileReader()
    reader.onload = e => {
      preview.src = e.target.result
      previewWrapper.classList.remove('d-none')
    }
    reader.readAsDataURL(file)
  }

  browseBtn.addEventListener('click', (e) => {
    e.preventDefault()
    fileInput.click()
  })

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      selectedFile = e.target.files[0]
      showPreview(selectedFile)
      results.classList.add('d-none')
    }
  })

  ;['dragenter','dragover','dragleave','drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => e.preventDefault())
  })

  dropzone.addEventListener('dragover', () => dropzone.classList.add('dragover'))
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'))

  dropzone.addEventListener('drop', (e) => {
    dropzone.classList.remove('dragover')
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectedFile = e.dataTransfer.files[0]
      showPreview(selectedFile)
      results.classList.add('d-none')
    }
  })

  predictBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      alert('Please select an image first')
      return
    }

    spinner.classList.remove('d-none')
    predictBtn.disabled = true

    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      const resp = await fetch('/predict', {
        method: 'POST',
        body: fd
      })
      const data = await resp.json()

      if (resp.ok && data.predictions) {
        resultsList.innerHTML = ''

        data.predictions.forEach(p => {
          const li = document.createElement('li')
          li.className = 'list-group-item'

          const badgeClass = p.breed === 'local' ? 'bg-success' : 'bg-warning'
          const barClass = p.breed === 'local' ? 'bg-success' : 'bg-warning'

          li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong>${p.label}</strong>
              <span class="badge ${badgeClass}">
                ${p.breed.toUpperCase()}
              </span>
            </div>

            <div style="display:flex;gap:0.75rem;align-items:center;margin-top:6px;">
              <div class="progress w-100">
                <div class="progress-bar ${barClass}"
                  role="progressbar"
                  style="width:${(p.prob * 100).toFixed(1)}%"
                  aria-valuenow="${(p.prob * 100).toFixed(1)}"
                  aria-valuemin="0"
                  aria-valuemax="100">
                </div>
              </div>
              <small>${(p.prob * 100).toFixed(1)}%</small>
            </div>
          `
          resultsList.appendChild(li)
        })

        results.classList.remove('d-none')
      } else {
        alert(data.error || 'Prediction failed')
      }
    } catch (err) {
      console.error(err)
      alert('Prediction error, see console for details')
    } finally {
      spinner.classList.add('d-none')
      predictBtn.disabled = false
    }
  })

  tryAgain.addEventListener('click', (e) => {
    e.preventDefault()
    selectedFile = null
    previewWrapper.classList.add('d-none')
    fileInput.value = ''
    results.classList.add('d-none')
  })

})()
