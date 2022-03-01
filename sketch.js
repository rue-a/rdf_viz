
const PREFIXES = [
  'PREFIX dqv: <http://www.w3.org/ns/dqv#>',
  'PREFIX dct: <http://purl.org/dc/terms/>',
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
  'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
  'PREFIX gkq: <https://geokur-dmp.geo.tu-dresden.de/quality-register#>'
];

const PREDICATES = [
  'dqv:inDimension',
  'dqv:inCategory',
  'skos:broader'
]


let canvas


const width = window.innerWidth;
const height = window.innerHeight;
const horizontal_margin = width / 5;
const vertical_margin = height / 5;
const radius = 20;

let left_clicked_x;
let left_clicked_y;
let coords_old = {};
let clicked_node;
let hover = true;

const node_model = new Model();
const view = new View(node_model, width, height, horizontal_margin, vertical_margin, radius)

let strg_pressed = false;


function enable_hover() {
  let description = null
  for (let p5node of view.get_nodes()) {
    let hover = p5node.hover();
    if (hover) description = hover;
  }
  if (description) {
    var text_width = textWidth(String(description));


    fill(100);
    noStroke()
    rect(mouseX - 6, mouseY - 12, text_width + 12, 16);
    fill(255);
    // noStroke()
    text(String(description), mouseX, mouseY);
  }
}

function doubleClicked() {
  for (let p5node of view.get_nodes()) {
    let node_id = p5node.double_clicked();
    if (node_id) {
      for (let predicate of PREDICATES) {
        node_model.expand_node(node_id, predicate).then(() => {
          // view.update_data(exclude_node_id = node_id);
          view.update_data();
        })
      }
    }
  }
}

keyPressed = function () {
  // strg pressed
  if (keyCode === 17) {
    strg_pressed = true;
  }
}
keyReleased = function () {
  strg_pressed = false;
}

function mousePressed() {
  hover = false;
  if (mouseButton === LEFT) {
    clicked_node = false;
    for (let p5node of view.get_nodes()) {
      if (p5node.left_clicked()) clicked_node = true;
    }
    if (strg_pressed) {
      strg_pressed = false;

      for (let p5node of view.get_nodes()) {
        p5node.strg_plus_left_clicked();
      }
    }
    left_clicked_x = mouseX;
    left_clicked_y = mouseY;
    for (let p5node of view.get_nodes()) {
      coords_old[p5node.get_id()] = {
        'x': p5node.get_x(),
        'y': p5node.get_y()
      }
    }

  }
  if (mouseButton === RIGHT) {

  }
  if (mouseButton === CENTER) {
    for (let p5node of view.get_nodes()) {
      let node_id = p5node.right_clicked();
      if (node_id) {
        let edges = node_model.get_edges()
        // delete all nodes and edges
        for (let i = edges.length - 1; i >= 0; i--) {
          let edge = edges[i]
          if (
            (edge.from == node_id)
            ||
            (edge.to == node_id)
          ) {
            node_model.remove_edge(edge);
          }
        }
        node_model.remove_node(node_id);
        view.remove_node(node_id);
        view.update_data();
      }
    }
  }
}

function mouseReleased() {
  hover = true;
  for (let p5node of view.get_nodes()) {
    p5node.released();
  }
}

function mouseDragged() {


  for (let p5node of view.get_nodes()) {
    p5node.dragged()
  }
  if (!(clicked_node)) {
    view.translate_nodes(left_clicked_x, left_clicked_y, coords_old)
  }
}

function mouseWheel(event) {
  if (event.delta < 0) {
    view.zoom_in()
  }
  else {
    view.zoom_out()
  }
}


function setup() {

  canvas = createCanvas(width, height);
  canvas.mouseOver(() => {
    for (let p5node of view.get_nodes()) {
      let id = p5node.hover();
      print(id)
    }
  })
  node_model.set_endpoint("https://geokur-dmp2.geo.tu-dresden.de/fuseki/geokur_quality_register/sparql")
  node_model.set_prefixes(PREFIXES)


  node_model.add_node('https://geokur-dmp.geo.tu-dresden.de/quality-register#qualityRegister').then(() => {
    view.update_data();
  })

  // view.switch_mode()


}


function draw() {


  // console.log(node_model)
  // background('white');
  clear();

  view.update_canvas()
  if (hover) enable_hover();

  // for (let p5arrowConnector of p5arrowConnectors) {
  //   p5arrowConnector.show();
  // }
  // for (let p5node of Object.values(p5nodes)) {
  //   p5node.show();
  // }

}
