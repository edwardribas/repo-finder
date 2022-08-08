(() => {
    const repositories = document.querySelector('.repositories'),
        profileInfo = document.querySelector('.general_info'),
        form = document.querySelector('form'),
        formInput = document.querySelector('form input'),
        errorBox = document.querySelector('.error'),
        errorTitle = document.querySelector('.error h1'),
        errorMsg = document.querySelector('.error p'),
        loadingIcon = document.querySelector('.loading')
    ;
    
    // fetch data storage
    let userReposResponse;
    let userProfileResponse;
    let sortBy = undefined;
    
    // sort repo items
    const sortRepositoryItems = isThereAFilter => {
        const repoItems = Array.from(document.querySelectorAll('.repo'));

        if (isThereAFilter) {
            repoItems.forEach((e, i) => {
                sortBy === 0
                    ? repoItems.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date))
                    : repoItems.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date))
                repositories.appendChild(e);
            })
        } else {
            repoItems.forEach(e => {
                repoItems.sort((a, b) => a.dataset.key - b.dataset.key);
                repositories.appendChild(e)
            })
        }
    }

    // error box
    const getError = errCode => {
        const errors = {
            403: "Reached request limit.",
            404: "User not found.",
            400: "Verify the field's syntax."
        }
    
        errorTitle.textContent = `An error has occurred (${errCode})`;
        errorMsg.textContent = errors[errCode] || "Unknown error.";
        errorBox.classList.add('active');
    
        const errorTimeout = setTimeout(() =>
            errorBox.classList.remove('active'), 2000)
    }
    
    // update repositories
    const updateRepositories = (jsonRepositories) => {
        // jejenee
        if (!jsonRepositories.length) {
            [loadingIcon, filtersContainer, sortButton].forEach(e => e.classList.remove('active'))
            sortItem.forEach(e => e.classList.remove('active'));
            repositories.innerHTML = '';
            repositories.setAttribute('author', '');
            sortBy === undefined;
            return;
        }
        const [{owner: {login: authorUsername}}] = jsonRepositories;
        repositories.setAttribute('author', authorUsername.toLowerCase());
        repositories.innerHTML = "";
        
        jsonRepositories.forEach((obj, index) => {
            const repositoryItem = document.createElement('div');
            repositoryItem.classList = "repo";
            
            const repositoryTitle = document.createElement('div');
            repositoryTitle.classList = "repo_title";
            repositoryItem.setAttribute('data-date', obj.created_at);
            repositoryItem.setAttribute('data-key', index);
            const repositoryCreatedAt = new Date(obj.created_at);
    
            repositoryTitle.innerHTML = `
                <div class="text">
                    <img src="${obj.owner.avatar_url}">
                    <h2>${obj.name}</h2>
                    <p>Created at ${repositoryCreatedAt.toLocaleDateString('en-us', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    })}</p>
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
        
        const profileCreatedAt = new Date(created_at)
    
        profileInfo.innerHTML = `
            <img src="${avatar_url}">
            Name: ${name ? name : 'Unavailable'}
            <p>Created at ${profileCreatedAt.toLocaleDateString('en-us', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            })}</p>
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
    
    const fetchUserData = async username => {
        loadingIcon.classList.add('active');
    
        // profile
        const profileResponse = await fetch(`https://api.github.com/users/${username}`);
        if (profileResponse.status !== 200) {
            getError(profileResponse.status);
            [loadingIcon, filtersContainer, sortButton, profileInfo].forEach(e => e.classList.remove('active'))
            sortItem.forEach(e => e.classList.remove('active'));
            repositories.innerHTML = '';
            profileInfo.innerHTML = '';
            repositories.setAttribute('author', '');
            sortBy === undefined;
            return
        }
        const profileData = await profileResponse.json();
        
        // repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`); 
        const reposData = await reposResponse.json();
    
        loadingIcon.classList.remove('active');
        
        // data
        userProfileResponse = {...profileData};
        updateProfile(userProfileResponse);
    
        userReposResponse = [...reposData];
        updateRepositories(userReposResponse, sortBy !== undefined)
    }
    
    // form submit
    form.onsubmit = e => {
        e.preventDefault()
        const username = formInput.value;
        if (username === "" || username.toLowerCase() == repositories.getAttribute('author')) return;
        fetchUserData(username);
    }
    
    // prevent spaces
    formInput.oninput = e => {
        const replacedInputValue = formInput.value.replaceAll(' ', '');
        if (e.inputType === 'insertFromPaste' && !e.data || e.data && e.data.includes(' ')) formInput.value = replacedInputValue;
    }
    
    // Filters
    const sortButton = document.querySelector('main > fieldset button'),
    filtersContainer = document.querySelector('main > fieldset > fieldset'),
    sortItem = document.querySelectorAll('main > fieldset > fieldset span');
    
    const handleSort = () => {
        sortButton.classList.toggle('active');
        filtersContainer.classList.toggle('active', sortButton.classList.contains('active'));

        if (!filtersContainer.classList.contains('active')) {
            sortBy = undefined;
            sortItem.forEach(e => e.classList.remove('active'));
            sortRepositoryItems(false);
        }
    }
    
    const handleSelectOrder = (query, index) => {
        if (sortBy === index) return;
        if (!repositories.children.length) return;
        sortItem.forEach(e => e.classList.remove('active'));
        query.classList.add('active');
        sortBy = index;
        sortRepositoryItems(sortBy !== undefined);
    }
    
    sortItem.forEach((e, i) => {
        e.onclick = () => handleSelectOrder(e, i)
    })
    sortButton.onclick = () => handleSort();
})()