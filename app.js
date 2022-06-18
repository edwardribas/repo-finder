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
            boxErrorMessage = `Pesquisa inválida.`;
    }
    
    errorMsg.textContent = boxErrorMessage
    errorBox.classList.add('active');

    error = setTimeout(() => {
        errorBox.classList.remove('active');
    }, 2000)
}

// update repositories
const updateRepositories = repoList => {
    repoList.forEach(obj => {
        const repo = document.createElement('div');
        repo.classList = "repo"

        // repo title
        const repoTitle = document.createElement('div');
        repoTitle.classList = "repo_title"
        const repoTitleImage = document.createElement('img');
        repoTitleImage.src = obj.owner.avatar_url;
        const repoTitleText = document.createElement('div');
        repoTitleText.classList = "text";
        const repoTitleH2 = document.createElement('h2');
        repoTitleH2.textContent = obj.name;

        const repoTitleDate = document.createElement('p');
        let date = obj.created_at;
        let year = +date.substr(0, 4);
        let month = +date.substr(5, 2);
        let day = +date.substr(8, 2);
        const getMonth = month => {
            let months = [
                'January', 'February', 'March',
                'April', 'May', 'June',
                'July', 'August', 'September',
                'October', 'November', 'December',
            ]
            return months[month-1];
        }
        month = getMonth(month);
        repoTitleDate.textContent = `Created at ${month} ${day}, ${year}`;

        [repoTitleH2, repoTitleDate].forEach(e => repoTitleText.appendChild(e));
        [repoTitleImage, repoTitleText].forEach(e => repoTitle.appendChild(e));

        // repo desc
        const repoDesc = document.createElement('p');
        repoDesc.classList = "repo_desc";
        repoDesc.textContent = obj.description ? obj.description : "No description provided.";

        // repo tags
        const repoTags = document.createElement('div');
        repoTags.classList = "repo_tags";
        const topics = obj.topics;
        topics.forEach(value => {
            const topic = document.createElement('span');
            topic.textContent = value;
            repoTags.appendChild(topic);
        })

        // repo link
        const repoLink = document.createElement('a');
        repoLink.classList = "repo_link";
        repoLink.textContent = "Visit";
        repoLink.setAttribute('href', obj.html_url);
        repoLink.setAttribute('target', "_blank");

        [repoTitle, repoDesc, repoTags, repoLink].forEach(item => {
            if (item.innerHTML) repo.appendChild(item)
        });
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
    getRepositories(username);
}

// prevent spaces and username max length
formInput.oninput = e => {
    if (e.data === " " || formInput.value.length === 40) {
        formInput.value = formInput.value.substring(0, formInput.value.length-1)
    }
}