const repositories = document.querySelector('.repositories'),
      profileInfo = document.querySelector('.general_info'),
      form = document.querySelector('form'),
      formInput = document.querySelector('form input'),
      errorBox = document.querySelector('.error'),
      errorTitle = document.querySelector('.error h1'),
      errorMsg = document.querySelector('.error p')
;

let userReposResponse;
let userProfileResponse;



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
// creation date
const getCreationDate = date => {
    return {
        year: +date.substr(0, 4),
        month: getMonth(+date.substr(5, 2)),
        day: +date.substr(8, 2)
    }
}

// update repositories
const updateRepositories = jsonRepositories => {
    const [{owner: {login: authorUsername}}] = jsonRepositories;
    repositories.setAttribute('author', authorUsername);
    repositories.innerHTML = "";
    
    jsonRepositories.forEach(obj => {
        const repositoryItem = document.createElement('div');
        repositoryItem.classList = "repo";

        const repositoryTitle = document.createElement('div');
        repositoryTitle.classList = "repo_title";
        const repositoryCreatedAt = getCreationDate(obj.created_at);
        repositoryTitle.innerHTML = `
            <div class="text">
                <img src="${obj.owner.avatar_url}">
                <h2>${obj.name}</h2>
                <p>Created at ${repositoryCreatedAt.month} ${repositoryCreatedAt.day}, ${repositoryCreatedAt.year}</p>
            </div>
        `;
            
        const repositoryDescription = document.createElement('p');
        repositoryDescription.classList = "repo_desc";
        repositoryDescription.textContent = obj.description ? obj.description : "No description provided.";
        
        const repositoryTopics = document.createElement('div');
        repositoryTopics.classList = "repo_tags";
        obj.topics.forEach(value => {
            const topic = document.createElement('span');
            topic.textContent = value;
            repositoryTopics.appendChild(topic);
        })

        const repositoryLink = document.createElement('a');
        repositoryLink.classList = "repo_link";
        repositoryLink.textContent = "Visit";
        repositoryLink.setAttribute('href', obj.html_url);
        repositoryLink.setAttribute('target', "_blank");

        // appends all the elements in the repo item
        [repositoryTitle, repositoryDescription, repositoryTopics, repositoryLink].forEach(item => {
            if (item.innerHTML) repositoryItem.appendChild(item)
        });

        // appends the repo item inside the repositories container
        repositories.appendChild(repositoryItem);
    })
}

const updateProfile = obj => {
    const {
        avatar_url, name, created_at, followers, 
        following, public_repos, login, html_url
    } = obj;

    
    const profileCreatedAt = getCreationDate(created_at);

    profileInfo.innerHTML = `
        <img src="${avatar_url}">
        <p>Name: ${name}</p>
        <p>Created at ${profileCreatedAt.month} ${profileCreatedAt.day}, ${profileCreatedAt.year}</p>
        <div class="social">
            <div title="Followers">
                <i class="fa-solid fa-user-group"></i>
                <span>${followers}</span>
            </div>
            <div title="Following">
                <i class="fa-solid fa-user-check"></i>
                <span>${following}</span>
            </div>
            <div title="Public repositories">
                <i class="fa-solid fa-folder"></i>
                <span>${public_repos}</span>
            </div>
        </div>
        <div class="links">
            <a href="${html_url}" target="_blank">Go to profile</a>
            <a href="https://github.com/${login}?tab=repositories" target="_blank">Repositories</a>
        </div>
    `;
    profileInfo.classList.add('active');
}

// get repo and user data
const fetchGitData = async username => {
    // user
    const profileResponse = await fetch(`https://api.github.com/users/${username}`);
    if (profileResponse.status !== 200) {
        getError(profileResponse.status);
        return;
    }
    const profileData = await profileResponse.json();
    
    // repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`); 
    const reposData = await reposResponse.json();
    
    // data
    userProfileResponse = {...profileData};
    updateProfile(userProfileResponse);

    userReposResponse = [...reposData];
    updateRepositories(userReposResponse)
    
}

// form submit
form.onsubmit = e => {
    e.preventDefault()
    const username = formInput.value;
    if (username === "" || username == repositories.getAttribute('author')) return;
    
    fetchGitData(username);
}

// prevent spaces
formInput.oninput = e => {
    if (e.data === " ") formInput.value = formInput.value.replace(" ", "");
}