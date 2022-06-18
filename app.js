const repositories = document.querySelector('.repositories'),
      form = document.querySelector('form'),
      formInput = document.querySelector('form input'),
      errorBox = document.querySelector('.error'),
      errorTitle = document.querySelector('.error h1'),
      errorMsg = document.querySelector('.error p')
;

// error box
const getError = errCode => {
    errorTitle.textContent = `Ocorreu uma falha (${errCode})`;
    let boxErrorMessage;

    switch(errCode){
        case 403:
            boxErrorMessage = `Limite de requisição atingido =P`
            break;
        case 404:
            boxErrorMessage = `Usuário não encontrado.`
            break;
        case 400:
            boxErrorMessage = `Verifique a sintaxe do campo de busca.`
            break;
        default:
            boxErrorMessage = `Procure se informar sobre o erro.`;
    }
    
    errorMsg.textContent = boxErrorMessage;
    errorBox.classList.add('active');

    error = setTimeout(() => {
        errorBox.classList.remove('active');
    }, 2000)
}

// get months
const getMonth = month => {
    let months = [ 
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December' 
    ]
    return months[month-1];
}

// update repositories
const updateRepositories = repoList => {
    const [{owner: {login: author}}] = repoList;
    repositories.setAttribute('author', author);
    
    repoList.forEach(obj => {
        // declarations
        const repo = document.createElement('div');
        const repoTitle = document.createElement('div');
        const repoTitleImage = document.createElement('img');
        const repoTitleText = document.createElement('div');
        const repoTitleH2 = document.createElement('h2');
        const repoTitleDate = document.createElement('p');
        const repoDesc = document.createElement('p');
        const repoTags = document.createElement('div');
        const repoLink = document.createElement('a');

        // classes
        repoTitle.classList = "repo_title"
        repo.classList = "repo";
        repoTitleText.classList = "text";
        repoDesc.classList = "repo_desc";
        repoTags.classList = "repo_tags";
        repoLink.classList = "repo_link";

        // repo name and date
        repoTitleH2.textContent = obj.name;
        let year = +obj.created_at.substr(0, 4);
        let month = +obj.created_at.substr(5, 2);
        let day = +obj.created_at.substr(8, 2);
        repoTitleDate.textContent = `Created at ${getMonth(month)} ${day}, ${year}`;
        repoTitleImage.src = obj.owner.avatar_url;

        // text and date -> repoTitleText ; repoTitleText and repoTitleImage -> repoTitle
        [repoTitleH2, repoTitleDate].forEach(e => repoTitleText.appendChild(e));
        [repoTitleImage, repoTitleText].forEach(e => repoTitle.appendChild(e));

        // repo description
        repoDesc.textContent = obj.description ? obj.description : "No description provided.";
        
        // repo tags
        obj.topics.forEach(value => {
            const topic = document.createElement('span');
            topic.textContent = value;
            repoTags.appendChild(topic);
        })

        // repo link
        repoLink.textContent = "Visit";
        repoLink.setAttribute('href', obj.html_url);
        repoLink.setAttribute('target', "_blank");

        // appends all the elements in the repo item
        [repoTitle, repoDesc, repoTags, repoLink].forEach(item => {
            if (item.innerHTML) repo.appendChild(item)
        });

        // appends the repo item inside the repositories container
        repositories.appendChild(repo);
    })


}

// get git response
const getRepositories = username => {
    fetch("https://api.github.com/users/" + username + "/repos").then(response => {
        if (response.status === 200) return response.json();

        if (response.status !== 200 && !errorBox.classList.contains('active')) 
            getError(response.status);

    }).then(json => {
        if (json) {
            repositories.innerHTML = "";
            updateRepositories(json);
        }
    })
}

// form submit
form.onsubmit = e => {
    e.preventDefault()
    const username = formInput.value;
    if (username === "") return;

    if (username == repositories.getAttribute('author')) return;

    console.log('Pesquisando...')
    getRepositories(username);
}

// prevent spaces
formInput.oninput = e => {
    if (e.data === " ") formInput.value = formInput.value.replace(" ", "");
}