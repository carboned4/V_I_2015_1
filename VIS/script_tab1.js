/*
https://github.com/mbostock/d3/wiki/Selections
http://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
http://jsfiddle.net/spanndemic/5JRMt/
https://github.com/mbostock/d3/wiki/Arrays
mercator:
https://gist.github.com/patricksurry/6621971
https://github.com/mbostock/d3/blob/master/src/geo/mercator.js
http://stackoverflow.com/questions/20020895/insert-background-image-as-a-d3js-object
http://stackoverflow.com/questions/11566935/how-to-access-data-of-a-d3-svg-element
http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
https://groups.google.com/forum/#!topic/d3-js/pvovPbU5tmo

tooltips:
http://bl.ocks.org/biovisualize/1016860
http://bl.ocks.org/ilyabo/1373263
*/


      $(document).ready(function () {
    var icon = $('.play');
    icon.click(function () {
        icon.toggleClass('active');
        return false;
    });
});

var dataset, full_dataset, shown_dataset,line_dataset; //var dataset é inútil (mas não apagar ainda), as outras são usadas

var year_min = 1896, year_max = 2008;

var searchedCountry = "United States";

var selectedSport = "Aquatics";
var previousSport = "#c1";
var selectedMedals = "numberBronze";

var mapdrawn = false;

var merc;
var projection;
var doit;

var sportsChoices = ["All Sports", "Aquatics", "Archery", "Athletics", "Badminton",
"Baseball", "Basketball", "Basque Pelota", "Boxing", "Canoe / Kayak", "Cricket",
"Croquet", "Cycling", "Equestrian", "Fencing", "Football", "Golf", "Gymnastics",
"Handball", "Hockey", "Ice Hockey", "Jeu de paume", "Judo", "Lacrosse",
"Modern Pentathlon", "Polo", "Rackets", "Roque", "Rowing", "Rugby", "Sailing",
"Shooting", "Skating", "Softball", "Table Tennis", "Taekwondo", "Tennis", "Triathlon",
"Tug of War", "Volleyball", "Water Motorsports", "Weightlifting", "Wrestling"];

var sportsChoicesElement;
var sportsSelectElement;
function createSportsDropdown(){
	sportsChoicesElement = document.getElementsByClassName("sidebar-links")[0];
	sportsChoicesElement.style.height=window.innerHeight-80;
	var spsel = document.createElement("div");
	spsel.class="link-blue";
	sportsSelectElement = sportsChoicesElement.appendChild(spsel);
	var kindofsport;
	for(kindofsport in sportsChoices){
		var child = document.createElement("a");
		//child.addEventListener("click", function () {changeSportsSpecial()});
		child.id="c"+kindofsport;
	
		child.innerHTML = sportsChoices[kindofsport];
		child.value = sportsChoices[kindofsport];
		sportsSelectElement.appendChild(child);
		d3.select("#c"+kindofsport).on("click",changeSportsSpecial);
	}
}

function updateMedalsString(){
	selectedMedals = "number";
	if(document.getElementById("numberBronze").checked) selectedMedals+="Bronze";
	if(document.getElementById("numberSilver").checked) selectedMedals+="Silver";
	if(document.getElementById("numberGold").checked) selectedMedals+="Gold";
	shown_dataset = process_data(full_dataset);
	gen_bars();
	gen_bubbles();
	gen_line();
}


function changeSportsSpecial(){
	d3.select(previousSport).style("background-color","#35393e");
	previousSport="#"+d3.select(this).attr("id");
	selectedSport=sportsChoices[parseInt(d3.select(this).attr("id").slice(1))];
	d3.select(this).style("background-color","green");
	changeSport();


}

function changeSport(){
	//selectedSport = document.getElementById("sportsSelectElement").value;
	shown_dataset = process_data(full_dataset);
	gen_bars();
	gen_bubbles();
	changeCountry();
}

function startAnim(){
	if(document.getElementById("yo").className=="play active")
	stopAnim();
	else {
	var a_min = $("#slider-range").slider("values",0);
	var a_max = a_min; //these are a value 0-28
	$("#slider-range").slider("values",1,a_min); //set both sliders to the minimum slider
	$("#slider-range").slider("values",0,a_max);
	year_max = year_min = 1896 + a_min*4;
	$( "#amount" ).val(year_min + " - "+ year_max );
	changeYear();
	doit= setInterval(animate, 1000);
	}
}

function stopAnim(){
	clearInterval(doit);
}

function animate(){
	if(year_max >= 2008){
		var icon = $('.play');
		icon.toggleClass('active');
		clearInterval(doit);
		year_max = year_min = 2008;
		return;
	}
	var a_max = $("#slider-range").slider("values",1) +1;
	var a_min = a_max; //these are a value 0-28
	$("#slider-range").slider("values",1,a_max); //set both sliders to the minimum slider
	$("#slider-range").slider("values",0,a_min);
	$( "#amount" ).val((year_min +4)+ " - "+ (year_max+4) );
	year_max = year_min = 1896 + a_min*4;
	changeYear();
}

function changeYear(){
	var a_max = $("#slider-range").slider("values",1);
	var a_min = a_max; //these are a value 0-28
	year_max = year_min = 1896 + a_min*4;
	shown_dataset = process_data(full_dataset);
	gen_bars();
	gen_bubbles();
}


function changeCountry(){
searchedCountry = document.getElementById("country").value;
	if(selectedSport!= "All Sports")
		line_dataset = process_line(full_dataset);
	else 
	line_dataset = process_line(sumSports(full_dataset,1896,2008));
gen_line();
}

function process_line(data_in){
	var unfiltered_data = data_in.filter(function(a){
		if(a["country_name"] == searchedCountry && a["Sport"] == selectedSport ){
		
		return a[selectedMedals];
		}
		else return;
	});
	var return_dataset = unfiltered_data.sort(function(a, b){
		return  a["Edition"] - b["Edition"] ;
	});
	return return_dataset;
}

var sliders;
function fixDoubleSlider(){
	sliders = d3.select("#slider-range").selectAll("span")[0];
	console.log("detected "+sliders.length + " sliders. if 2, all okay");
	sliders[0].id="slidermin";
	sliders[1].id="slidermax";
	sliders[0].className+=" sliderpequeno";
	sliders[1].className+=" sliderpequeno";
	sliders[0].className+=" slidermin";
	sliders[1].className+=" slidermax";
	sliders[0].innerHTML+="MIN";
	sliders[1].innerHTML+="MAX";
}

$(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 28,
      values: [ 0, 28 ],
      slide: function( event, ui ) {
        $( "#amount" ).val((1896+ui.values[0]*4) + " - "+ (1896+ui.values[1]*4) );
		year_min = 1896+ui.values[0]*4;
		year_max = 1896+ui.values[1]*4;
		shown_dataset = process_data(full_dataset);
		gen_bars();
		gen_bubbles();
      }
    });
    $( "#amount" ).val(($( "#slider-range" ).slider( "values", 0 )*4+1896) +
      " - " + ($( "#slider-range" ).slider( "values", 1 )*4+1896) );
  });

function startupscript(){
	document.getElementsByClassName("main-content")[0].style.height=window.innerHeight-43;
	fixDoubleSlider();
	createSportsDropdown();
	d3.select("#c1").style("background-color","green");
}

/*adds all the sports into All Sports, by year and country*/
function sumSports(unsummed_data,min,max){
	var summed = new Array();
	var entry;
	var curryear;

	//for each year, we count the number of medals of each country
	for(curryear = min; curryear <= max; curryear +=4){
		var sumsforthisyear = new Array();
		var unsummedforthisyear = unsummed_data.filter(function(a){return a.Edition == curryear;});
		//^here we have the data for each country in a certain year
		//for each country-sport in this year, we add its medals to the country's count
		for (entry in unsummedforthisyear){
			var startedcounting = false;
			//we check if we've already started counting for this country or not
			for(countrythisyear in sumsforthisyear){
				var blarow = sumsforthisyear[countrythisyear];
				//we have started counting:
				if(blarow.NOC == unsummedforthisyear[entry].NOC){
					startedcounting = true;
					blarow.numberBronze = parseInt(blarow.numberBronze) + parseInt(unsummedforthisyear[entry].numberBronze);
					blarow.numberBronzeSilver = parseInt(blarow.numberBronzeSilver) + parseInt(unsummedforthisyear[entry].numberBronzeSilver);
					blarow.numberBronzeSilverGold = parseInt(blarow.numberBronzeSilverGold) + parseInt(unsummedforthisyear[entry].numberBronzeSilverGold);
					blarow.numberBronzeGold = parseInt(blarow.numberBronzeGold) + parseInt(unsummedforthisyear[entry].numberBronzeGold);
					blarow.numberSilver = parseInt(blarow.numberSilver) + parseInt(unsummedforthisyear[entry].numberSilver);
					blarow.numberSilverGold = parseInt(blarow.numberSilverGold) + parseInt(unsummedforthisyear[entry].numberSilverGold);
					blarow.numberGold = parseInt(blarow.numberGold) + parseInt(unsummedforthisyear[entry].numberGold);
					break;
				}
			}
			//if we haven't started counting (because it doesn't exist in the counting):
			if(!startedcounting){
				sumsforthisyear.push({
					Edition: unsummedforthisyear[entry].Edition,
					NOC: unsummedforthisyear[entry].NOC,
					Sport: "All Sports",
					country_name: unsummedforthisyear[entry].country_name,
					ioc_code: unsummedforthisyear[entry].ioc_code,
					iso2_code: unsummedforthisyear[entry].iso2_code,
					latitude: unsummedforthisyear[entry].latitude,
					longitude: unsummedforthisyear[entry].longitude,
					numberBronze: unsummedforthisyear[entry].numberBronze,
					numberBronzeGold: unsummedforthisyear[entry].numberBronzeGold,
					numberBronzeSilver: unsummedforthisyear[entry].numberBronzeSilver,
					numberBronzeSilverGold: unsummedforthisyear[entry].numberBronzeSilverGold,
					numberGold: unsummedforthisyear[entry].numberGold,
					numberSilver: unsummedforthisyear[entry].numberSilver,
					numberSilverGold: unsummedforthisyear[entry].numberSilverGold
				});
			}
		}
		for (entry in sumsforthisyear){
			summed.push(sumsforthisyear[entry]);
		}
	
	}
	return summed;
}

/* adds all the medals of a country in the specified sport*/
function sumYears(unsummed_data){
	var summed = new Array();
	var entry;
	var i_sports;

	//for each sport, we count the number of medals of each country
	for(i_sports = 0; i_sports <= sportsChoices.length; i_sports +=1){
		var sumsforthissport = new Array();
		var unsummedforthissport = unsummed_data.filter(function(a){return a.Sport == sportsChoices[i_sports];});
		//^here we have the data for each country for a certain sport (could be All Sports which counts more than one)
		//for each country-year in this sport, we add its medals to the country's count
		for (entry in unsummedforthissport){
			//console.log(sportsChoices[i_sports] + sportsChoices.length + i_sports);
			var startedcounting = false;
			//we check if we've already started counting for this country or not
			for(countrythissport in sumsforthissport){
				var blarow = sumsforthissport[countrythissport];
				//console.log(sportsChoices[i_sports]);
				//we have started counting:
				
				if(blarow.NOC == unsummedforthissport[entry].NOC){
					//console.log("update "+blarow.NOC + blarow.Sport);
					startedcounting = true;
					blarow.numberBronze = parseInt(blarow.numberBronze) + parseInt(unsummedforthissport[entry].numberBronze);
					blarow.numberBronzeSilver = parseInt(blarow.numberBronzeSilver) + parseInt(unsummedforthissport[entry].numberBronzeSilver);
					blarow.numberBronzeSilverGold = parseInt(blarow.numberBronzeSilverGold) + parseInt(unsummedforthissport[entry].numberBronzeSilverGold);
					blarow.numberBronzeGold = parseInt(blarow.numberBronzeGold) + parseInt(unsummedforthissport[entry].numberBronzeGold);
					blarow.numberSilver = parseInt(blarow.numberSilver) + parseInt(unsummedforthissport[entry].numberSilver);
					blarow.numberSilverGold = parseInt(blarow.numberSilverGold) + parseInt(unsummedforthissport[entry].numberSilverGold);
					blarow.numberGold = parseInt(blarow.numberGold) + parseInt(unsummedforthissport[entry].numberGold);
					break;
				}
			}
			//if we haven't started counting (because it doesn't exist in the counting):
			if(!startedcounting){
				//console.log("add"+unsummedforthissport[entry].NOC);
				sumsforthissport.push({
					Edition: year_min+"-"+year_max,
					NOC: unsummedforthissport[entry].NOC,
					Sport: unsummedforthissport[entry].Sport,
					country_name: unsummedforthissport[entry].country_name,
					ioc_code: unsummedforthissport[entry].ioc_code,
					iso2_code: unsummedforthissport[entry].iso2_code,
					latitude: unsummedforthissport[entry].latitude,
					longitude: unsummedforthissport[entry].longitude,
					numberBronze: unsummedforthissport[entry].numberBronze,
					numberBronzeGold: unsummedforthissport[entry].numberBronzeGold,
					numberBronzeSilver: unsummedforthissport[entry].numberBronzeSilver,
					numberBronzeSilverGold: unsummedforthissport[entry].numberBronzeSilverGold,
					numberGold: unsummedforthissport[entry].numberGold,
					numberSilver: unsummedforthissport[entry].numberSilver,
					numberSilverGold: unsummedforthissport[entry].numberSilverGold
				});
			}
		}
		for (entry in sumsforthissport){
			summed.push(sumsforthissport[entry]);
		}
	}
	return summed;
}

var testarray;
// filter by sport, handle years, do total of medals chosen, sort by total of medals chosen
function process_data(data_in){
	//Year in range
	var yearrange_data = data_in.filter(function(a){
		return ((a.Edition <= year_max) && (a.Edition >= year_min));
	});
	//Sport
	var sportfiltered_data;
	if(selectedSport == "All Sports") sportfiltered_data = yearrange_data;
	else{
		sportfiltered_data = yearrange_data.filter(function(a){
			return a.Sport == selectedSport;
		});
	}
	//handle "all sports"
	var summedsport_data;
	if(selectedSport == "All Sports"){
		summedsport_data = sumSports(sportfiltered_data,year_min,year_max);
		testarray = summedsport_data;
	}
	else
		summedsport_data = sportfiltered_data;
	//handle year ranges
	var summedyear_data;
	if(year_min < year_max){
		summedyear_data = sumYears(summedsport_data);
		testarray = summedyear_data;
	}
	else
		summedyear_data = summedsport_data;
	//Remove zero elements
	var unzeroed_data = summedyear_data.filter(function(a){ //remove zeros do tiago
		return a[selectedMedals] > 0;
	});
	var return_dataset = unzeroed_data.sort(function(a, b){
		return b[selectedMedals] - a[selectedMedals];
	});
	d3.selectAll(".tooltip").remove();
	if((year_min == year_max) && (year_min==1940 || year_min == 1944 || year_min == 1916)){
		document.getElementById("warpic").style.visibility = "visible";
	}
	else document.getElementById("warpic").style.visibility = "hidden";
	return return_dataset;
}


d3.csv("medals_improved.csv", function (data) {
    full_dataset = data;    
    shown_dataset = process_data(full_dataset);
	changeCountry();
	gen_bars();
	gen_bubbles();
	//gen_map();
})


function gen_bars() {
    var w = 600;
    //var h = 400;
	var bar_thickness = 20;
    var padding=30;
	var between_bars = 10;
	var bar_stroke_thickness = 2;
	var bar_shift_right = 200;
	var medal_label_shift_right = 20;


		
    d3.select("#bar_chart").selectAll("svg").remove();
    var svg = d3.select("#bar_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",shown_dataset.length*(between_bars+bar_thickness));
	
    var hscale = d3.scale.sqrt()
                         .domain([0,d3.max(shown_dataset,function(d){
							return parseInt(d[selectedMedals]);})])
                         .range([0,w - bar_shift_right - medal_label_shift_right - 60]);

    var yscale = d3.scale.linear()
                         .domain([0,shown_dataset.length])
                         .range([0,shown_dataset.length*(bar_thickness+between_bars)]);

    
	/*
	parte em que se desenha as bubbles
	*/
    var bars = svg.selectAll("g")
		.data(shown_dataset);
		
	var bars_enter = bars.enter().append("g");
       
	//make the bars
	bars_enter.append("rect").attr("height",bar_thickness)
	    .attr("width",function(d) {
						if(!d[selectedMedals]) return hscale(0.5); //for a short bar
						return hscale(d[selectedMedals]); //medals shown
	                   })
	    .attr("fill",function(d) { if (d.country_name==searchedCountry)
										return "red";
										return "rgb(0,150,255)";})	     
	    .on("click", colorbubbles)
		.attr("y",function(d, i) {
                          return bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x",bar_shift_right+ bar_stroke_thickness/2)
		.attr("stroke-width",3).attr("stroke","black")
		.attr("id",function(d) { return "bar_"+d.NOC;})
	    .on("mouseover", function(d){
			var ttlabel = d.NOC + " - " + d[selectedMedals] + " medals";
			var ttid = "tt_"+d.NOC;
			d3.select("body")
				.append("div")
				.attr("class","tooltip")
				.attr("id",ttid)
				.text(ttlabel);
		})
		.on("mousemove", function(d){
			d3.select("#tt_"+d.NOC).style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		})
		.on("mouseout", function(d){
			d3.select("#tt_"+d.NOC).remove();//style("visibility", "hidden");
		});
	
	//make the medal number label
	bars_enter.append("text").text(function(d) {if (!d[selectedMedals]) return 0; return d[selectedMedals];})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", function(d){
							return bar_shift_right + bar_stroke_thickness/2 + hscale(d[selectedMedals]) + medal_label_shift_right});
	
	//make the country name label
	bars_enter.append("text").text(function(d) {return d.country_name;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", 0)
		
	//exit?

	
}

var bubblesvg;
var path;
var projection;
var zoom_multiplier = 1;
var g;
function gen_bubbles() {
	//zoom_multiplier = 1;
	var w = 600;
    var h = 300;
	var bar_thickness = 20;
    var padding=30;
	var between_bars = 10;
	var bar_stroke_thickness = 1;
	var bar_shift_right = 200;
	var medal_label_shift_right = 20;
	var max_radius = 10;
	var min_amount_for_label = 10;
	var radius_for_zero = 0.5
	
	
	
    d3.selectAll(".bubble").remove();
	if(!mapdrawn){
			bubblesvg = d3.select("#bubble_map")
			.append("svg")
			.attr("width",w)
			.attr("height",h);
	}
	
	
    var radiusscale = d3.scale.log()
						.domain([radius_for_zero*0.9,d3.max(shown_dataset,function(d){
							return parseInt(d[selectedMedals]);})])
                         .range([0,max_radius]);
	
    var yscale = d3.scale.linear()
                         .domain([-90,90])
                         .range([h,0]);
	
	var xscale = d3.scale.linear()
                         .domain([-180,180])
                         .range([0,w]);
	
	projection = d3.geo.mercator()
		.center([0,0])
		.translate([280,180])
		.scale(100);
	path = d3.geo.path()
		.projection(projection);

		
	if(!mapdrawn){
		g = bubblesvg.append("g");
		// load and display the World
		d3.json("topojson.v0.min.json", function(error, topology) {
		g.selectAll("path")
		  .data(topojson.object(topology, topology.objects.countries)
			  .geometries)
		.enter()
		  .append("path")
		  .attr("d", path)
		});
		mapdrawn = true;
	}
	/*
	parte em que se desenha
	*/
	var bubbles = bubblesvg.selectAll("g.hack") //remove the first g element (map)
		.data(shown_dataset);
		
	var bubbles_enter = bubbles.enter().append("g");
       
	var transformFromMap = g.attr("transform");
	//make the bubbles
	bubbles_enter.attr("class", "bubble")
		.append("circle")
	    .attr("r",function(d) {
                          if(!d[selectedMedals]) return radiusscale(radius_for_zero);
						  return radiusscale(d[selectedMedals])/zoom_multiplier; //medals shown
	                   })
	    .attr("fill",function(d) { if (d.country_name==searchedCountry)
										return "red";
										return "rgb(0,150,255)";})	     
	    .on("click", colorbars)
		.attr("cy",function(d) {
                          return projection([d.longitude,d.latitude])[1];
	                   })
	    .attr("cx",function(d) {
                          return projection([d.longitude, d.latitude])[0];
	                   })
		.attr("stroke-width",3/zoom_multiplier).attr("stroke","black")
		.attr("id",function(d) { return "bubble_"+d.NOC;})
		.on("mouseover", function(d){
			var ttlabel = d.NOC + " - " + d[selectedMedals] + " medals - "+d.country_name;
			var ttid = "tt_"+d.NOC;
			d3.select("body")
				.append("div")
				.attr("class","tooltip")
				.attr("id",ttid)
				.text(ttlabel);
		})
		.on("mousemove", function(d){
			d3.select("#tt_"+d.NOC).style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		})
		.on("mouseout", function(d){
			d3.select("#tt_"+d.NOC).remove();
		});

	
	//fixes zooming in, changing year, then zooming/dragging
	bubbles_enter.attr("transform", transformFromMap)
	.attr("d", path.projection(projection));
	
	
	var zoom = d3.behavior.zoom()
    .on("zoom",function() {
		var toApply = (zoom_multiplier == d3.event.scale ? 1 : d3.event.scale/zoom_multiplier); 
		zoom_multiplier = d3.event.scale;
		g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection));
        g.selectAll("path")  
            .attr("d", path.projection(projection));
		bubbles_enter.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		bubbles_enter.selectAll("circle")
            .attr("d", path.projection(projection))
			.attr("r", function(){
				return d3.select(this).attr("r")/toApply;
			})
			.attr("stroke-width", function(){
				return d3.select(this).attr("stroke-width")/toApply;
			});
		
	});
	
	d3.select("#country").on("change", colorbarandbubbles);
	bubblesvg.call(zoom);
	
}


function gen_line() {
    var w = 600;
    var h = 400;
	var dataSize = line_dataset.length;
	var maxNumber=0;

	for(var i =0; i<dataSize;i++){
		if(maxNumber < parseInt(line_dataset[i][selectedMedals]))
			maxNumber = parseInt(line_dataset[i][selectedMedals]);
}
		d3.select("#line_chart").selectAll("svg").remove();
    var svg = d3.select("#line_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",h);

	
    var xscale = d3.scale.linear()
                        .domain([1896,2008])
                        .range([32,w-32]);

    var yscale = d3.scale.sqrt()
                         .domain([0,maxNumber])
                         .range([h-35,10]);

    
	var xAxis = d3.svg.axis()
	.tickValues(d3.range(1896, 2009,8))
	.tickFormat(d3.format("d"))
    .scale(xscale);
  
	var yAxis = d3.svg.axis()
    .scale(yscale)
	.orient("left").tickSize(0)
	.tickValues(function(){
		if(maxNumber > 150) return [0,2,10,20,50,100,175,250,350,450];
		else if (maxNumber < 10) return [0,1,2,3,4,5,6,7,8,9,10]
		else if (maxNumber < 15) return [0,1,2,3,5,8,12,15]
		else if (maxNumber < 30) return [0,1,2,3,5,7,10,15,20,25,30]
		else if (maxNumber < 50) return [0,1,2,5,10,15,25,35,50]
		else if (maxNumber < 75) return [0,1,2,5,10,20,30,50,75];
		else return [0,1,2,5,10,20,30,50,75,100, 120, 150]; //75 a 150
	})
	.tickFormat(d3.format("g"));
	
	svg.append("svg:g")
	.attr("class","axis")
	.attr("transform", "translate(0,"+(h-35)+")")
    .call(xAxis)/*.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)" )*/;

    svg.append("svg:g")
    .attr("class","axis")
    .attr("transform", "translate(30,0)")
    .call(yAxis);


	var lineGen = d3.svg.line()
	.x(function(d) {
	return xscale(d.Edition);
	})
	.y(function(d) {
	return yscale(d[selectedMedals]);
	});

 
 

	svg.append('svg:path')
		.attr('d', lineGen(line_dataset))
		.style('stroke', 'red')
		.style('stroke-width', 2)
		.style("fill", "none");

  


	svg.selectAll("circle").data(line_dataset).enter()
	.append('svg:circle')
	.attr("cx", function(d) {
						  return xscale(d.Edition);
					   })
	.attr("cy", function(d) {
						  return  yscale(d[selectedMedals]);
					   })
	.attr("r",5)
	.style("fill","red")
	.on("click", function (d) {goToYear(d.Edition)})
	.on("mouseover", function(d){
			var ttlabel = d.NOC + " - " + d[selectedMedals] + " medals" + " in " + d.Edition;
			var ttid = "tt_"+d.NOC;
			d3.select("body")
				.append("div")
				.attr("class","tooltip")
				.attr("id",ttid)
				.text(ttlabel);
	})
	.on("mousemove", function(d){
		d3.select("#tt_"+d.NOC).style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
	})
	.on("mouseout", function(d){
		d3.select("#tt_"+d.NOC).remove();//style("visibility", "hidden");
	});

}

function getNOCforName(nametofind){
	for(el in shown_dataset){
		var possiblecountry = shown_dataset[el];
		if(possiblecountry.country_name == nametofind){
			return possiblecountry.ioc_code;
		}
	}
	return null;
}

function getNameforNOC(ioctofind){
	for(el in shown_dataset){
		var possiblecountry = shown_dataset[el];
		if(possiblecountry.ioc_code == ioctofind){
			return possiblecountry.country_name;
		}
	}
	return null;
}

function IdToId(barid){
	return barid.split("_")[1];
}

var previousCountry = "United States";
function colorbars(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	
	var bartohighlight = d3.select(this).attr("id");
	var bartohighlightID = IdToId(bartohighlight);
	previousCountry = getNameforNOC(bartohighlightID);
	d3.select("#bar_"+bartohighlightID).attr("fill","red");
	d3.select("#bubble_"+bartohighlightID).attr("fill","red");
	searchedCountry = previousCountry;
	document.getElementById("country").value=searchedCountry;
	changeCountry();
	return;
}

function colorbubbles(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	
	var bubbletohighlight = d3.select(this).attr("id");
	var bubbletohighlightID = IdToId(bubbletohighlight);
	previousCountry = getNameforNOC(bubbletohighlightID);
	d3.select("#bar_"+bubbletohighlightID).attr("fill","red");
	d3.select("#bubble_"+bubbletohighlightID).attr("fill","red");
	searchedCountry = previousCountry;
	document.getElementById("country").value=searchedCountry;
	changeCountry();
	return;
}

function colorbarandbubbles(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	searchedCountry = document.getElementById("country").value;
	previousCountry = searchedCountry;
	d3.select("#bar_"+getNOCforName(searchedCountry)).attr("fill","red");
	d3.select("#bubble_"+getNOCforName(searchedCountry)).attr("fill","red");

		
	return;
}

function goToYear(edition){
	for(var i=0;i<line_dataset.length;i++){
		if(line_dataset[i]["Edition"]==edition){
			console.log(parseInt(edition));
			year_min=parseInt(edition);
			year_max=parseInt(edition);
			$("#slider-range").slider("values",1,parseInt((edition-1896)/4)); //set both sliders to the minimum slider
			$("#slider-range").slider("values",0,parseInt((edition-1896)/4));
			$( "#amount" ).val(year_min + " - "+ year_max );
			changeYear();
		}		
	}
}