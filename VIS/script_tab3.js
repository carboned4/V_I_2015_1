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
*/

var dataset, full_dataset, shown_dataset; //var dataset é inútil (mas não apagar ainda), as outras são usadas

var year_min, year_max;

var merc;
var projection;

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
	sportsChoicesElement = document.getElementById("sportschoices");
	sportsSelectElement = sportsChoicesElement.appendChild(document.createElement("select"));
	var kindofsport;
	for(kindofsport in sportsChoices){
		var child = document.createElement("option");
		child.innerHTML = sportsChoices[kindofsport];
		child.value = sportsChoices[kindofsport];
		if(child.value == "Aquatics") child.selected= true;
		sportsSelectElement.appendChild(child);
	}
}

$(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 1896,
      max: 2008,
      values: [ 2008, 2008 ],
      slide: function( event, ui ) {
        $( "#amount" ).val(ui.values[ 0 ] + " - "+ ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );
  });

function startupscript(){
	createSportsDropdown();
}
	
// filter by sport, handle years, do total of medals chosen, sort by total of medals chosen
function process_data(data_in){
	var return_dataset = data_in.sort(function(a, b){
		return b.numberBronze - a.numberBronze;
	});
	return return_dataset;
}

d3.csv("medals_test1.csv", function (data) {
    full_dataset = data;    
    shown_dataset = process_data(full_dataset);
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


		
    var svg = d3.select("#bar_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",1000);
	
    var hscale = d3.scale.linear()
                         .domain([0,d3.max(shown_dataset,function(d){
							return d.numberBronze;})])
                         .range([0,40/*w-medal_label_shift_right-40*/]);

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
						if(!d.numberBronze) return hscale(0.5); //for a short bar
						return hscale(d.numberBronze); //medals shown
	                   })
	    .attr("fill","rgb(0,150,255)")	     
	    .attr("y",function(d, i) {
                          return bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x",bar_shift_right+ bar_stroke_thickness/2)
		.attr("stroke-width",3).attr("stroke","black")
		.attr("id",function(d) { return "bar "+d.NOC;})
	    .append("title")
		.text(function(d) { return d.NOC;});	//country identifier
	
	//make the medal number label
	bars_enter.append("text").text(function(d) {if (!d.numberBronze) return 0; return d.numberBronze;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", function(d){
							return bar_shift_right + bar_stroke_thickness/2 + hscale(d.numberBronze) + medal_label_shift_right});
	
	//make the country name label
	bars_enter.append("text").text(function(d) {return d.country_name;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", 0)
		.append("title")
		.text(function(d) { return d.NOC;});	//country identifier
		
	//exit?

	
}
/*
function gen_map(){
	var width = 1000,
    var height = 500;

	var projection = d3.geo.mercator()
	.center([0,0])
	.scale(100);

	var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path()
    .projection(projection);

var g = svg.append("g");

// load and display the World
d3.json("topojson.v0.min.json", function(error, topology) {
    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
          .geometries)
    .enter()
      .append("path")
      .attr("d", path)
});

svg.call(zoom)

	
}
*/

var zoom_multiplier = 1;
function gen_bubbles() {
	
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
	
	var projection = d3.geo.mercator()
		.center([0,0])
		.translate([280,180])
		.scale(100);
	var path = d3.geo.path()
		.projection(projection);

	
    var svg = d3.select("#bubble_map")
                .append("svg")
                .attr("width",w)
                .attr("height",h);
	
	
	
    var radiusscale = d3.scale.log()
						.domain([radius_for_zero*0.9,d3.max(shown_dataset,function(d){
							return d.numberBronze;})])
                         .range([0,max_radius]);
	
    var yscale = d3.scale.linear()
                         .domain([-90,90])
                         .range([h,0]);
	
	var xscale = d3.scale.linear()
                         .domain([-180,180])
                         .range([0,w]);
	
	
	var g = svg.append("g");
	// load and display the World
	d3.json("topojson.v0.min.json", function(error, topology) {
    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
          .geometries)
    .enter()
      .append("path")
      .attr("d", path)
	});
	
	/*
	parte em que se desenha
	*/
	var bubbles = svg.selectAll("g.hack") //remove the first g element (map)
		.data(shown_dataset);
		
	var bubbles_enter = bubbles.enter().append("g");
       
	//make the bubbles
	bubbles_enter.append("circle")
	    .attr("r",function(d) {
                          if(!d.numberBronze) return radiusscale(radius_for_zero);
						  return radiusscale(d.numberBronze)/zoom_multiplier; //medals shown
	                   })
	    .attr("fill","rgb(0,150,255)")	     
	    .attr("cy",function(d) {
                          return projection([d.longitude,d.latitude])[1];
	                   })
	    .attr("cx",function(d) {
                          return projection([d.longitude, d.latitude])[0];
	                   })
		.attr("stroke-width",3).attr("stroke","black")
		.attr("id",function(d) { return "bubble "+d.NOC;})
	    .append("title")
		.text(function(d)
			{   if(!d.numberBronze) return d.NOC + " - 0 medals\n"+d.country_name;
				return d.NOC + " - " + d.numberBronze + " medals\n"+d.country_name;}
		);
	
	//make the medal number label
	bubbles_enter.append("text").text(function(d) {
						if (d.numberBronze < min_amount_for_label) return "";
						return d.numberBronze;
		})
		.attr("y",function(d) {
                          return projection([d.longitude, d.latitude+1])[1];
	                   })
	    .attr("x", function(d) {
                          return projection([d.longitude-2.5, d.latitude])[0];
	                   })
		.attr("fill","white");
	bubbles.exit().remove();
	
	var zoom = d3.behavior.zoom()
    .on("zoom",function() {
		var toApply = (zoom_multiplier == d3.event.scale ? 1 : d3.event.scale/zoom_multiplier); 
		zoom_multiplier = d3.event.scale;
		console.log(zoom_multiplier);
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
		bubbles_enter.selectAll("text")
            .attr("d", path.projection(projection))
			.style("font-size", function(){
				return parseFloat(d3.select(this).style("font-size"))/toApply;
			})/*
			.attr("y", function(d) {
				
				return projection([d.longitude, d.latitude+1-1/toApply])[1];
	                   })
			.attr("x", function(d) {
				
				return projection([d.longitude-2.5+2.5/toApply, d.latitude])[0];
	                   })*/;
	});
	
	
	//exit?
	svg.call(zoom);
	
	
}
