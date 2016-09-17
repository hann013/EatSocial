

// function scrollNav(){
// 	console.log('scrolling');
// 	var topheight = $('.hero').height()- (2* $('.nav-bar').height());
// 	if (document.body.scrollTop >= 400){
// 		document.getElementsByClassName("nav-bar")[0].classList.add("dark");
// 	}
// 	if (document.body.scrollTop < 400){
// 		document.getElementsByClassName("nav-bar")[0].classList.remove("dark");
// 	}
// }

function scrollTo(toSection){
	console.log('Jump to: '+toSection);
	$('body').animate({
		scrollTop: $(toSection).offset().top - $('.nav-bar').height()}, 500);
}

function goTo(toSection){
	console.log('Go to: '+toSection);

	// if (toSection == 'home'){
	// 	document.getElementById('')
	// }

	$('.flood-section').hide();
	if (!desk) {toggleNavMenu();}

	document.getElementById(toSection).style.display = 'block';
}

var desk = false;
var showMenu = false;

function onWindowResize() {
	if ($(window).innerWidth() < 720){
        desk = false;
        console.log("mobile");
        showMenu = false;
        $('.nav-menu').hide();
    }

    // else if ($(window).innerWidth() < 921){
    //     $scope.tablet = true;
    //     $scope.desk = false;
    //     //console.log("tablet");
    // }

    else {
    	desk = true;
        console.log("desk");
        showMenu = true;
        $('.nav-menu').show();
    }
}

$(window).resize(onWindowResize);

function toggleNavMenu() {
	$('.nav-menu').toggle();
}

$(document).ready(function(){
	goTo('home');
	onWindowResize();
});



