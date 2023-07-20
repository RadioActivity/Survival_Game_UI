let data = localStorage.getItem("hideout_survival");
const defaultdata = {
	"version": 0,
	"name": "홍길동",
	"location": "은신처",
	"location_searched": 0,
	"days": 1,
	"health": 100,
	"hunger": 50,
	"thirsty": 50,
	"energy": 60,
	"search_speed": 2,
	"search_speed_variance": 1,
	"condition": [],
	"equipments": {
		"armor": {},
		"weapon1": {},
		"weapon2": {},
		"light": {},
		"bag": {}
	},
	"inventory": [
		{id: 0, amount: 2, used: 0},
		{id: 1, amount: 3, used: 0},
		{id: 2, amount: 3, used: 0}
	],
	"inv_capacity": 8,
	"stash": [
		{id: 0, amount: 100, used: 0},
		{id: 1, amount: 80, used: 0},
		{id: 4, amount: 1, used: 0},
		{id: 3, amount: 1, used: 0}
	],
	"stash_capacity": 100
}

//장소별 아이템 드랍 확률 목록
const loots = {
	"폐허": {
		appear_chance: 1000,
		size: "4x4",
		items: [
			{id: 0, min: 1, max: 2},
			{id: 1, min: 1, max: 2},
			{id: 4, min: 0, max: 1}
		]
	},
	"주택": {
		appear_chance: 350,
		size: "3x3",
		items: [
			{id: 0, min: 2, max: 4},
			{id: 1, min: 2, max: 3},
			{id: 2, min: 0, max: 1},
			{id: 3, min: 0, max: 1}
		]
	},
	"빌라": {
		appear_chance: 300,
		size: "4x4",
		items: [
			{id: 0, min: 3, max: 6},
			{id: 1, min: 3, max: 6},
			{id: 2, min: 1, max: 2},
			{id: 3, min: 0, max: 1}
		]
	},
	"상점": {
		appear_chance: 200,
		size: "3x3",
		items: [
			{id: 0, min: 2, max: 3},
			{id: 1, min: 2, max: 3},
			{id: 2, min: 1, max: 2},
			{id: 5, min: 0, max: 1}
		]
	},
	"마트": {
		appear_chance: 85,
		size: "5x5",
		items: [
			{id: 0, min: 4, max: 8},
			{id: 1, min: 4, max: 7},
			{id: 2, min: 2, max: 3},
			{id: 8, min: 1, max: 3},
			{id: 9, min: 1, max: 3},
			{id: 3, min: 1, max: 2},
			{id: 6, min: 1, max: 1},
			{id: 4, min: 0, max: 1}
		]
	},
	"약국": {
		appear_chance: 50,
		size: "4x4",
		items: [
			{id: 1, min: 3, max: 4},
			{id: 3, min: 1, max: 2},
			{id: 8, min: 1, max: 2},
			{id: 9, min: 1, max: 2}
		]
	}
}

let total_appear_chances = 0;
for (let key in loots) {
	total_appear_chances += loots[key].appear_chance;
}


function resetData () {
	data = isCopyObj(defaultdata);
	localStorage.setItem("hideout_survival", JSON.stringify(data, null, 0));
}

Number.prototype.addplus = function (end = "") { return ( this > 0 ? "+"+this : this )+end }
Number.prototype.stat_percent = function () { return Math.floor(100*(this-1)).addplus("%"); }
Number.prototype.percent = function (point = 0) { return Math.floor(100*Math.pow(10, point)*this)/Math.pow(10, point)+"%"; }

// 깊은 복사 함수 https://cocobi.tistory.com/156 개조했음
function isCopyObj(origin) {
    let res = {};
    for (let key in origin) {
      if (typeof origin[key] === 'object') {
			if (Array.isArray(origin[key])) res[key] = origin[key].slice(); 
			else res[key] = isCopyObj(origin[key]);
      } else {
          res[key] = origin[key];
      }
    }
    return res;
}

//배열 요소 섞기
Array.prototype.shuffle = function () {
  return this.sort(() => Math.random() - 0.5);
}

if (data == null) resetData();

else {
	data = JSON.parse(data, null, 0);
}

saveGame = function() {
	localStorage.setItem("hideout_survival", JSON.stringify(data, null, 0));
}

//이미지 태그 만들기
createImg = function (type, classes) {
	let img = [
		"https://www.seekpng.com/png/full/19-197364_contact-us-gerenciadecostosmecor-net-ve-png-for-loading.png",
		"https://www.seekpng.com/png/full/15-157749_white-magnifying-glass-clip-art-at-clker-magnifying.png"
		];
	return '<img src="'+img[type]+'" alt="shit발.." class="'+classes+'">';
}

//버튼 만들기
createBtn = function (text, id = "", classes = "", onclick = "") {
	id = ( id == "" ? "" : 'id = "'+id+'" ' );
	classes = ( classes == "" ? "" : 'class = "'+classes+'" ' );
	onclick = ( onclick == "" ? "" : 'onclick = "'+onclick+'" ' );
	return '<button '+id+classes+onclick+'" >'+text.replace(/\n/g,"<br>")+'</button>';
}

//inventory, stash 의 안에 있는 아이템 무게를 측정
Object.prototype.getItemsWeight = function () {
	let res = 0;
	this.forEach( (v, i) => {
		res += items[v.id].weight*v.amount;
	});
	return res;
}

//상태창 새로고침
updateStatus = function () {
	document.getElementById("time").innerText = data.days+"일차";
	document.getElementById("health").style.width = data.health+"%";
	document.getElementById("hunger").style.width = data.hunger+"%";
	document.getElementById("thirsty").style.width = data.thirsty+"%";
	document.getElementById("energy").style.width = data.energy+"%";
	let ccc = (data.inventory.getItemsWeight()/data.inv_capacity);
	document.getElementById("weight").style.width = ccc.percent();
}

updateStatus();

//아이템 정보창
let inspect_dialog = document.getElementById("item_status");
let inspect_title = document.getElementById("inspect_title");
let inspect_lore = document.getElementById("inspect_lore");
let inspect_effects = document.getElementById("inspect_effects");
let inspect_act1 = document.getElementById("inspect_act1");
let inspect_act2 = document.getElementById("inspect_act2");

inspectItem = function (id, amount) {
	inspect_dialog.close();
	inspect_dialog.showModal();
	inspect_dialog.style.display = "grid";
	let item = items[id];
	let weight = item.weight;
	inspect_title.innerText = item.name + ' x'+amount;
	inspect_lore.innerText = weight + "kg (총 "+weight*amount+"kg)\n\n" + item.lore;
	let tag = item.tag;
	let tags = Object.keys(tag);
	let tag_translated = {
		"health": "체력",
		"hunger": "포만",
		"thirsty": "수분",
		"energy": "기력",
		"travel_speed": "탐사속도",
		"search_speed": "수색속도",
		"attack_damage": "공격력",
		"armor": "방어력",
		"durability": "내구력"
	}
	let effects = tags.map((v, i) => {
		let output = " - "+(tag_translated[v]?tag_translated[v]:v)+": ";
		switch(v){
			case "health":
			case "hunger":
			case "thirsty":
			case "energy":
				if ( tag[v] != 0 ) return output+tag[v].addplus();
				break;
			case "add_effect":
				
				break;
			case "remove_effect":
				
				break;
			case "add_capacity":
				return output+tag.add_capacity.addplus("kg");
				break;
			case "travel_speed":
			case "search_speed":
				return output+tag[v].stat_percent();
				break;
			case "attack_damage":
			case "armor":
			case "durability":
				return output+tag.durability;
				break;
			default:
				return output+tag[v];
		}
	});
	inspect_effects.innerText = effects.join("\n");
}

//아이템 정보창 닫기
document.getElementById("inspect_close").addEventListener('click', function() {
	inspect_dialog.close();
	inspect_dialog.style.display = "none";
})

//인벤토리 목록 업데이트
updateInventory = function () {
	let field = document.getElementById("inv_field");
	let insert = "";
	for(let i = 0; i < Math.ceil(data.inventory.length/5); i++ ){
		insert += '<div class="inv_row">';
		for(let j = 0; j < 5; j++ ) {
			if( i * 5 + j == data.inventory.length ) break;
			let invv = data.inventory[i * 5 + j];
			let text = items[invv.id].name+"\nx"+invv.amount;
			let func = "inspectItem("+invv.id+","+invv.amount+")";
			insert += createBtn(text, "", "inv_btn", func);
		}
		insert += '</div>';
	}
	
	field.innerHTML = insert;
}

updateInventory();

//창고 목록 업데이트
let actionTab = document.getElementById("loot_and_stash");
let action_title = document.getElementById("stash_title");
let action_field = document.getElementById("loot_field");
let action_act1 = document.getElementById("act_1");
let action_act2 = document.getElementById("act_2");

updateStash = function () {
	data.location = "은신처";
	action_title.innerText = "창고";
	action_field.className = "stash_field";
	action_act1.innerText = "탐사 시작";
	action_act2.innerText = "수면";
	let insert = "";
	for(let i = 0; i < Math.ceil(data.stash.length/5); i++){
		insert += '<div class="inv_row">';
		for(let j = 0; j < 5; j++ ) {
			if( i * 5 + j == data.stash.length ) break;
			let invv = data.stash[i * 5 + j];
			let text = items[invv.id].name+"\nx"+invv.amount;
			let func = "inspectItem("+invv.id+","+invv.amount+")";
			insert += createBtn(text, "", "inv_btn", func);
		}
		insert += '</div>';
	}
	loot_field.innerHTML = insert;
}

updateStash();

//수색장소 생성
makeNewLoots = function (cost = 0, loc = "random") {
	if(loc == "random") {
		let finded = Math.random()*total_appear_chances;
		let stack = 0;
		for (let key in loots) {
			if (stack + loots[key].appear_chance >= finded) {
				loc = key;
				break;
			}
			stack += loots[key].appear_chance;
		}
	} else {
		if(Object.keys(loots).indexOf(loc) == -1) return console.error("잘못 입력된 장소입니다.");
	}
	data.location = loc;
	data.energy -= cost;
	action_field.className = "loot_"+loots[loc].size;
	action_field.innerHTML = "";
	action_title.innerText = loc;
	action_act1.innerText = "이동";
	action_act2.innerText = "복귀";
	let pool = [];
	loots[loc].items.forEach( (v, i) => {
		let rpt = v.min+(Math.random()*(v.max-v.min+1))|0;
		for(let i = 0; i < rpt; i++) pool.push(v.id);
	});
	let scale = loots[loc].size.split("x");
	scale = scale[0]*scale[1]-pool.length;
	for (let j = 0; j < scale; j++) pool.push(-1);
	pool = pool.shuffle();
	for (let k = 0; k < pool.length; k++) {
		let name = pool[k] == -1 ? "꽝" : items[pool[k]].name;
		let func = "searching("+k+","+pool[k]+")";
		action_field.innerHTML += createBtn(createImg(1, "magnifier"), "", "loot_unknown", func);
	}
}

//수색장소 아이템 드랍률 정보창
let loot_dialog = document.getElementById("loot_table");
let loot_title = document.getElementById("loot_table_title");
let loot_lore = document.getElementById("loot_table_lore");

inspectLoot = function (location) {
	if(Object.keys(loots).indexOf(location) == -1) return console.error(location+"은(는) 잘못 입력된 장소입니다.");
	loot_dialog.close();
	loot_dialog.showModal();
	loot_dialog.style.display = "grid";
	loot_title.innerText = location;
	loot_lore.innerText = "해당 장소가 발견될 확률: "+(loots[location].appear_chance/total_appear_chances).percent(2);
	loot_lore.innerText += "\n\n"+loots[location].items.map( (v, i) => {
		return items[v.id].name+": "+(v.min == v.max ? v.max : v.min+"~"+v.max)+"개";
	}).join("\n")
}

document.getElementById("loot_table_close").addEventListener('click', function() {
	loot_dialog.close();
	loot_dialog.style.display = "none";
})

action_title.addEventListener('click', function() {
	inspectLoot(data.location);
});


searching = function (number, item, used = 0) {
	action_field.children[number].disabled = true;
	action_field.children[number].innerHTML = createImg(0, "loading");
	setTimeout(() => {
		action_field.children[number].disabled = false;
		action_field.children[number].className = "loot_known";
		action_field.children[number].onclick = "";
		if( item != -1 )
			action_field.children[number].innerText = items[item].name;
		else
			action_field.children[number].innerText = " ";
		
	}, (data.search_speed+Math.random()*data.search_speed_variance)*1000);
}


//inventory, stash 에 직접 사용
Object.prototype.giveItem = function (id, amount = 1, used = 0) {
	if ( id < 0 || id > items.length || isNaN(id) ){
		return console.error("올바르지 않은 아이템 아이디입니다.");
	}
	if ( isNaN(amount) ) {
		return console.error("숫자가 아닌 갯수입니다.");
	}
	if ( isNaN(used) ) {
		return console.error("숫자가 아닌 손상도입니다.");
	}
	let result = "";
	for(let i = 0; i < this.length; i++) {
		if(this[i].id == id && items[id].stackable) {
			result = items[id].name+" "+amount+"개를 적용하였습니다.";
			this[i].amount+amount < 0 ? this.splice(i, 1) : this[i].amount += amount;
			break;
		}
	}
	if ( result == "" && amount < 0 ) return console.error("없는 아이템을 제거할 수 없습니다.");
	if ( result == "" ){
		if ( !items[id].stackable && amount > 1 ) return console.error("stackable이 아닌 아이템은 1개만 추가할 수 있습니다.")
		this.push({id: id, amount: amount, used: used});
		result = items[id].name+" "+amount+"개를 적용하였습니다.";
	}
	console.log(result);
}

Object.prototype.useItem = function (id, amount) {
	if ( id < 0 || id > items.length || isNaN(id) ){
		return console.error("올바르지 않은 아이템 아이디입니다.");
	}
	if ( isNaN(amount) ) {
		return console.error("숫자가 아닌 횟수입니다.");
	}
	if ( amount < 1 ) {
		return console.error("0개 이하로 사용할 수 없습니다.");
	}
	if ( this.amount < amount ) {
		return console.error("가지고 있는 것보다 더 많이 사용할 수 없습니다.");
	}
	switch( items[id].type ) {
		case "food":
		case "consumable":
			this.giveItem(id, -amount);
			data.health = Math.min(data.health+items[id].tag.health * amount, 100);
			data.hunger = Math.min(data.hunger+items[id].tag.hunger * amount, 100);
			data.thirsty = Math.min(data.thirsty+items[id].tag.thirsty * amount, 100);
			data.energy = Math.min(data.energy+items[id].tag.energy * amount, 100);
			updateStatus();
			console.log(items[id].name+"을(를) "+amount+"번 사용했습니다.");
			break;
		case "light":
			
			break;
	}
}

let box = '<div style="border: 1px solid white"></div>';
let btn = '<button></button>';


//수색버튼
document.getElementById("act_1").addEventListener('click', function() {
  makeNewLoots();
})
//복귀(수색) 및 수면(은신처)
document.getElementById("act_2").addEventListener('click', function() {
  updateStash();
})