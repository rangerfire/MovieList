const apiKey = '9d3badb0c8d83a0bce6bf3cf96e3cc60';
const pageBaseURL = 'https://api.themoviedb.org/3/';
const imageBaseURL = 'https://image.tmdb.org/t/p/';   //need to add size and path
const lang = '&language=en-US';
const genreID = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37];   //0-18
const genreName = [
    "Action", "Adventure" ,"Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];
const genreColor = [
    "red", "lightblue", "orange", "indianred", "purple", "gold", "silver", "thistle", "brown", "pink", 
    "yellowgreen", "navy", "lime", "coral", "mediumturquoise", "chocolate", "tomato", "olive", "blueviolet"
];

let likedMovies = [];       //this array is to store liked movies: {id, posterURL, name, date}
let genres = [];            //this array is to store the genre id/name/color
let page = 1;
let pageCapacity = 20;
let pageData = {};      //same as the myData in fetch()
let posterSize = 'w300';
// let posterSize = 'original';
let foucusPage = 1;     //1 => movie list ,   2 => liked list 

//------------------------------------ DOM Objects in html page-----------------------------------
let loadingIcon = document.querySelector(".loading");

let main_page = document.querySelector(".main_page");
let MovieDetailPage = document.querySelector(".MovieDetailPage");

let MovieList = document.querySelector(".MovieList");
let LikedList = document.querySelector(".LikedList");    
let underlines = document.querySelectorAll(".underline");

let MovieListPage = document.querySelector("main");
let LikedListPage = document.querySelector(".LikedListPage");


let prevBtn = document.querySelector(".prev");
let nextBtn = document.querySelector(".next");

let movies = document.querySelectorAll(".movie");
let posters = document.querySelectorAll(".poster");
let names = document.querySelectorAll(".name");
let dates = document.querySelectorAll(".date");
let pageInfo = document.querySelector(".pageInfo");

let MDBack = document.querySelector(".MDBack");
let MDPoster = document.querySelector(".MDPoster");
let MDName = document.querySelector(".MDName");
let MDCategory = document.querySelector(".MDCategory");
let MDOverview = document.querySelector(".MDOverview");
let MDProducer = document.querySelector(".MDProducer");
let MDClose = document.querySelector(".MDClose");

let ConfigButton = document.querySelector(".ConfigButton");
let ConfigPage = document.querySelector(".ConfigPage");
//------------------------------------ DOM Objects -----------------------------------

//initial & set prev to disabled and ADD Listener to next and prev
function setPrevNext() {
    prevDisable();
    prevBtn.addEventListener("click", function() {
        page--;
        if(page == 1)
            prevDisable();
        getList(page);
    });
    nextBtn.addEventListener("click", function() {
        page++;
        prevEnable();
        getList(page);
        //need to add some restriction!!!!!!!!!!!!!!!!!for page > limit
    });
}
//get the popular movie list from TMDB
function getList(x) {
    loading();
    page = x;
    let action = 'movie/popular?api_key=';
    let thisurl = "".concat(pageBaseURL, action, apiKey, lang, '&page=', page);
    console.log(thisurl);
    fetch(thisurl)
    .then((res) => {
        return res.json();
    })
    .then((myData) => {
        pageData = myData;
        // console.log(pageData);
        //have got the data, the 20 movies are in 'results' array => show it in the page
        let len = myData.results.length;
        //befor updating, remove the loading gif
        removeloading();
        //update the aside bar first
        pageInfo.innerHTML = `Page ${page}/ Total ${myData.total_pages} of ${myData.total_results} results`;
        //update the whole list then
        for(let i=0;i<len;i++)
        {
            let thismovie = movies[i];
            let thisposter = posters[i];
            let thisname = names[i];
            let thisdate = dates[i];
            let thisURL = "".concat(imageBaseURL, posterSize, myData.results[i].poster_path);
            //for each movie in this page, set the css style first!--------------------               
            thismovie.style.flexBasis = "16vw";
            thismovie.style.display = "flex";
            thismovie.style.flexDirection = "column";
            thisposter.style.position = "relative";
            thisposter.style.flexBasis = "47vh";
            thisposter.style.backgroundSize = "100% 100%";
            thisposter.style.backgroundRepeat = "no-repeat";
            thisname.style.maxWidth = "16vw";
            //CSS style over--------------------------------------------------------------
            thisposter.style.backgroundImage = `url(${thisURL})`;
            thisname.innerHTML = myData.results[i].title;
            thisdate.innerHTML = myData.results[i].release_date;
        }
        //then add listener for click movie to show detail
        setClickMovieEvent(pageData);
        
    })
    .catch(function(err) {
        alert(err);
    });
}

//add listener for click a movie poster (should have pageData first!) && if you click like, add it to liked list (important!!!!!)
function setClickMovieEvent(pageData) {
    let len = pageData.results.length;
    for(let i=0;i<len;i++)
    {
        posters[i].mid = pageData.results[i].id;
        posters[i].mposterURL = "".concat(imageBaseURL, posterSize, pageData.results[i].poster_path);
        posters[i].mname = pageData.results[i].title;
        posters[i].mdate = pageData.results[i].release_date;
        posters[i].addEventListener("click", onMovieClick);
    }  
}
//event handler (for click a movie)
function onMovieClick(ev) {
    //if you click the poster
    if(ev.target.className == 'poster')
    {
        getMovie(ev.target.mid);
        //should show the movie detail page && hide the movie list page
        main_page.style.display = "none";
        MovieDetailPage.style.display = "flex";
    }
    //if you click the like icon, add this movie to likedMovies(if not alreay in the list!)
    else if(ev.target.className == 'likeIcon')
    {  
        let obj = {
            "id": ev.target.parentNode.mid,
            "posterURL": ev.target.parentNode.mposterURL,
            "name": ev.target.parentNode.mname,
            "date": ev.target.parentNode.mdate
        };
        if( checkId(ev.target.parentNode.mid) )
        {
            likedMovies.push(obj);
            navLikedList();
            addToLikedList(obj);
        }
        //if exists, show an alert
        else
            alert(`"${ev.target.parentNode.mname}" already in your list`);
    }
}

//add the new liked movie in liked list page
function addToLikedList(newMovie) {
    let newEle = document.createElement("div");
    let newP = document.createElement("div");
    let newN = document.createElement("div");
    let newD = document.createElement("div");
    newEle.className = "LikedMovie";
    newP.className = "LMPoster";
    newN.className = "LMName";
    newD.className = "LMDate"
    newEle.appendChild(newP);
    newEle.appendChild(newN);
    newEle.appendChild(newD);
    LikedListPage.appendChild(newEle);
    //we already have the css style in css file, so just add data into them
    newP.style.backgroundImage = `url("${newMovie.posterURL}")`;
    newN.innerHTML = newMovie.name;
    newD.innerHTML = newMovie.date;
    // updateConfigPage();
}
//update the liked list page using the likedMovies array (when change the liked movies order)
function updateLikedListPage() {
    let LikedMovie = document.querySelectorAll(".LikedMovie");
    for(let i=0;i<LikedMovie.length;i++)
        LikedListPage.removeChild(LikedMovie[i]);
    for(let j=0;j<likedMovies.length;j++)
        addToLikedList(likedMovies[j]);
}



//find a movie detail by id
function getMovie(id) {
    //loading before get the data
    loading();
    let action = `movie/${id}?api_key=`;
    let thisurl = "".concat(pageBaseURL, action, apiKey, lang);
    fetch(thisurl)
    .then((res) => {
        return res.json();
    })
    .then((MovieData) => {
        //got the movie data => MovieData
        console.log(MovieData);
        let releaseYear = MovieData.release_date.substring(0, 4);
        let backURL = `${imageBaseURL}original${MovieData.backdrop_path}`;
        let posterURL = `${imageBaseURL}original${MovieData.poster_path}`;
        //for back-img => linear-gradient( rgba(0,0,0,0.5), rgba(0,0,0,0.5) ),
        //set the background image
        MDBack.style.backgroundImage = `linear-gradient( rgba(0,0,0,0.5), rgba(0,0,0,0.5) ), url(${backURL})`;
        //set the poster
        MDPoster.style.backgroundImage = `url(${posterURL})`;        
        //set the movie name
        MDName.innerHTML = `${MovieData.title}(${releaseYear})`;
        // set the genres
        for(let i=0;i<MovieData.genres.length;i++)
        {
            let thisgenre = MovieData.genres[i].name;
            let genreIndex = genreName.indexOf(thisgenre);
            let node = document.createTextNode(thisgenre);
            let child = document.createElement("span");
            child.style.background = genreColor[genreIndex];
            child.appendChild(node);
            MDCategory.appendChild(child);
        }
        //set the overview
        MDOverview.innerHTML = `Overview: ${MovieData.overview}`;
        //set the producer
        for(let i=0;i<MovieData.production_companies.length;i++)
        {
            let thisCompanyURL = MovieData.production_companies[i].logo_path;
            if(thisCompanyURL) 
            {
                let newdiv = document.createElement("div");
                newdiv.style.backgroundImage = `url(${imageBaseURL}original${thisCompanyURL})`;
                newdiv.style.width = "8vw";
                newdiv.style.height = "10vh";
                MDProducer.appendChild(newdiv);
            }
            //if don't have logo, show the company name
            else
            {
                let thisCompanyName = MovieData.production_companies[i].name;
                let newdiv = document.createElement("div");
                newdiv.innerHTML = thisCompanyName;
                MDProducer.appendChild(newdiv);
            }
        }
        removeloading();
        //if leave this page, need to clean everything!
        addMDCloseEvent();
    })
    .catch(function(err) {
        alert(err);
    });
}

//add listener for Movie Detail page close button
function addMDCloseEvent(MovieData) {
    MDClose.addEventListener("click", function() {
        main_page.style.display = "block";
        MovieDetailPage.style.display = "none";
        cleanMDpage();
    });
}
//change from main-page to likedlist page (add event listener)
function setMovieLikedListPage() {
    MovieList.addEventListener("click", function() {
        //show the movie list (main) page and hide the liked list page
        setUnderline(1);
        MovieListPage.style.transform = `rotateY(0deg)`;
        LikedListPage.style.transform = `rotateY(-180deg)`;
    });
    LikedList.addEventListener("click", function() {
        //show the liked list page and hide the main movie list page
        setUnderline(2);
        MovieListPage.style.transform = `rotateY(-180deg)`;
        LikedListPage.style.transform = `rotateY(-360deg)`;
    });
}






//add listener for config button in Liked List page
function setConfigButton() {
    ConfigButton.addEventListener("click", function() {
        //before go to the config page, update it!
        // console.log(likedMovies.length);
        updateConfigPage();
        main_page.style.display = "none";
        ConfigPage.style.display = "flex";
        setConfigCloseButton();
    });
}
//update and show the movies on config page
function updateConfigPage() {
    let len = likedMovies.length;
    for(let i=0;i<len;i++)
    {
        //add new element for ConfigPage
        let newEle = document.createElement("div");
        newEle.className = "CPMovieName";
        //Make it draggable, and how to drag and drop!-----------------
        newEle.setAttribute("draggable", true);
        newEle.addEventListener("dragstart", ondragstart_Handler);
        newEle.addEventListener("dragover", ondragover_Handler);
        newEle.addEventListener("drop", ondrop_Handler);
        //set over-----------------------------------------------------
        newEle.innerHTML = likedMovies[i].name;
        ConfigPage.appendChild(newEle);
    }
}
function ondragstart_Handler(event) {
    event.dataTransfer.setData("MovieName", event.target.innerHTML);
    event.dataTransfer.dropEffect = "move";
}
function ondragover_Handler(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}
function ondrop_Handler(event) {
    event.preventDefault();
    let fromName = event.dataTransfer.getData("MovieName");
    let fromindex = findIndexByName(fromName);
    let toindex = findIndexByName(event.target.innerHTML);
    //console.log("from", fromindex, "to", toindex);
    let temp = event.target.innerHTML;
    let CPMovies = document.querySelectorAll(".CPMovieName");
    CPMovies[fromindex].innerHTML = temp;
    CPMovies[toindex].innerHTML = fromName;
    //this step works well, need to change the likedMovies list using this change! Remind to update likedlist page when close
    updatelikedMovies(fromindex, toindex);
}



//add lisetener to close the config page
function setConfigCloseButton() {
    let CloseButton = document.querySelector(".CloseButton");
    CloseButton.addEventListener("click", function() {
        main_page.style.display = "block";
        ConfigPage.style.display = "none";
        //clean the page before leave
        let allChildren = document.querySelectorAll(".CPMovieName");
        for(let i=0;i<allChildren.length;i++)
            ConfigPage.removeChild(allChildren[i]);
        //then, if the order is changed, update the liked list page
        updateLikedListPage();
    });
}





window.onload = function() {
    getList(1); 
    setUnderline(1);
    navLikedList();
    setPrevNext();
    setMovieLikedListPage();
    //add listener for config button
    setConfigButton();
}



//  https://image.tmdb.org/t/p/original/qVygtf2vU15L2yKS4Ke44U4oMdD.jpg  backdrop path
//  https://image.tmdb.org/t/p/original/bOKjzWDxiDkgEQznhzP4kdeAHNI.jpg  poster
//  https://api.themoviedb.org/3/movie/{movie_id}?api_key=<<api_key>>&language=en-US   movie detail


//show loading gif
function loading() {
    MovieListPage.style.display = "none";
    loadingIcon.style.display = "block";
}
//remove loading gif
function removeloading() {
    MovieListPage.style.display = "block";
    loadingIcon.style.display = "none";
}
//set the underline of the nav bar
function setUnderline(x) {
    foucusPage = x;
    if(foucusPage == 1)
    {
        underlines[0].style.display = "block";
        underlines[1].style.display = "none";
    }
    else
    {
        underlines[0].style.display = "none";
        underlines[1].style.display = "block";
    }
}
//clean the movie detail page (after close one)
function cleanMDpage() {    
    MDBack.style.backgroundImage = "";    
    MDPoster.style.backgroundImage = "";            
    MDName.innerHTML = "";    
    MDCategory.innerHTML = "";    
    MDOverview.innerHTML = "";
    MDProducer.innerHTML = "";
}
//judge whether to show the liked list in nav bar
function navLikedList() {
    let ListNumber = document.querySelector(".ListNumber");
    if(likedMovies.length == 0)
    {
        LikedList.style.display = "none";
    }
    else{
        LikedList.style.display = "block";
        ListNumber.innerHTML = likedMovies.length;
    }
}

//prev button disabled
function prevDisable() {
    prevBtn.disabled = true;
    prevBtn.innerHTML = "No More";
    prevBtn.style.border = "1px solid #dddddd";
    prevBtn.style.background = "#dddddd";
    prevBtn.style.color = "#666666";
}
//prev button enabled
function prevEnable() {
    prevBtn.disabled = false;
    prevBtn.innerHTML = "Prev";
    prevBtn.style.border = "";
    prevBtn.style.background = "";
    prevBtn.style.color = "";
}
//check if a movie already in likedList , existed->false, not -> true(can add this movie)
function checkId(mid) {
    for(let i=0;i<likedMovies.length;i++)
        if(likedMovies[i].id == mid)
            return false;
    return true;
}

//find the index by a movie name in likedmovies
function findIndexByName(Name) {
    for(let i=0;i<likedMovies.length;i++)
        if(likedMovies[i].name == Name)
            return i;
    alert("didn't find the index by name");
    return -1;
}
//change the likedMovies order using input 
function updatelikedMovies(fromindex, toindex) {
    //{id, posterURL, name, date}
    let tempid = likedMovies[fromindex].id;
    let tempURL = likedMovies[fromindex].posterURL;
    let tempname = likedMovies[fromindex].name;
    let tempdate = likedMovies[fromindex].date;
    likedMovies[fromindex].id     =    likedMovies[toindex].id;
    likedMovies[fromindex].posterURL = likedMovies[toindex].posterURL;
    likedMovies[fromindex].name   =    likedMovies[toindex].name;
    likedMovies[fromindex].date   =    likedMovies[toindex].date;
    likedMovies[toindex].id     =    tempid;
    likedMovies[toindex].posterURL = tempURL;
    likedMovies[toindex].name   =    tempname;
    likedMovies[toindex].date   =    tempdate;
}



//get a random color(NOT USE)
function getColor() {
    let cn = Math.floor(Math.random()*16777215).toString(16);
    while(cn.length<6) {
        cn += "0";
    }
    return "#" + cn;
}
//GET genre info from server(NOT USE)
function getGenre() {
    let thisURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;
    fetch(thisURL)
    .then(res => res.json())
    .then((genreData) => {
        //get the genre data
        console.log(genreData);
    })
    .catch(function(err) {
        alert(err);
    });
}
