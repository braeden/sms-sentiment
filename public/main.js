async function handleImageUpload(event) {
    const files = event.target.files
    const formData = new FormData()
    formData.append('xmlupload', files[0])
    const resp = await fetch('/upload', {
        method: 'POST',
        body: formData
    })
    let json = await resp.json()
    //Chart it
    console.log(json)
}

document.querySelector('#fileUpload').addEventListener('change', event => {
    handleImageUpload(event)
})