import { Injectable } from '@angular/core';

@Injectable()
export class NLGeneration {

  constructor() { }

  public possibleActions = []
  public selectedAmbiguity = 0
  public encodingKeys = ["x-Axis", "Values", "Color"]
  public additionalKeys = ["Highlight",  "ColorHighlight", "Filter"]

  initializeUnderstandingDisplay(that, actionList) {
    for (var i = document.getElementById("UnderstandingList").childNodes.length - 1; 0 <= i; i--) {
      var element = document.getElementById("UnderstandingList").childNodes[i];
      if (element["id"] != "DemonstrationGuide") {
        element.parentNode.removeChild(element);
      }

    }

    Object.keys(actionList).forEach(key => {
      if (key == "VISUALIZATION") {
        for (var element in actionList["VISUALIZATION"]["ADD"]) {
          this.creatCard(that, actionList["VISUALIZATION"]["ADD"][element] + " chart", "Visualization", "Change", "VISUALIZATION", null)
        }


      }
      if (key == "Aggregate") {
        for (var element in actionList["Aggregate"]["ADD"]) {
          if (actionList["Aggregate"]["ADD"][element]["KEY"] == "ALL") {
            this.creatCard(that, actionList["Aggregate"]["ADD"][element]["ID"], "Aggregate of all Values", "Change", "Aggregate_" + element["KEY"], null)
          }
          else {
            this.creatCard(that, actionList["Aggregate"]["ADD"][element]["ID"], "Aggregate of " + actionList["Aggregate"]["ADD"][element]["KEY"], "Change", "Aggregate_" + element["KEY"], null)
          }
        }
      }

      if (this.encodingKeys.includes(key)) {
        this.decisionPreparationEncoding(that, key, actionList)
      }

      if (this.additionalKeys.includes(key)) {
        this.decisionPreparation(that, key, actionList)
      }

      if(key == "FilterC"){
        this.decisionPreparationFilterC(that, actionList[key])
      }

      if(key == "FilterN"){
        this.decisionPreparationFilterN(that, actionList[key])
      }

    })


  }


  displayNewUnderstanding(that, newActionList, generalizedActionList) {

  }


  creatCard(that, attribute, target, type, id, verb) {
    var clone = null

    if (type == "Change") {
      clone = document.getElementById('TemplateChange').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].innerText = target
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[2].innerText = attribute


    }
    else if (type == "Select") {
      clone = document.getElementById('TemplateGeneral').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].value = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[4].innerText = target
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[2].innerText = attribute


    }
    else if (type == "SelectAll") {
      clone = document.getElementById('TemplateAll').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].value = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[3].innerText = target
    }
    else if (type == "SelectEncoding") {
      clone = document.getElementById('TemplateGeneralEncoding').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].value = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[4].innerText = target
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[2].innerText = attribute


    }
    else if (type == "SelectAllEncoding") {
      clone = document.getElementById('TemplateAllEncoding').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].innerText = target
    }
    else if(type == "FilterN"){
      clone = document.getElementById('TemplateFilterN').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].innerText = target
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[2].innerText = attribute
    }

    clone.children[2].children[0].children[0].onclick = that.closeITLElement.bind(that);

    if (document.getElementById("DemonstrationGuide")!.nextSibling) {
      document.getElementById("DemonstrationGuide")!.parentNode!.insertBefore(clone, document.getElementById("DemonstrationGuide")!.nextSibling)
    }
    else {
      document.getElementById("DemonstrationGuide")!.parentNode!.appendChild(clone)
    }

  }

  decisionPreparation(that, key, actionList){
    if(actionList[key]["ADD"].length == 0 && actionList[key]["REMOVE"].length > 0){
      if (actionList[key]["REMOVE"].includes("ALL")){
        this.creatCard(that, "ALL", key, "SelectAll", key +"_ALL", "Remove")
      }
      else{
        this.creatCard(that,  this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key +"_REMOVE", "Remove")
      }
    }
    else if (actionList[key]["ADD"].length > 0 && actionList[key]["ADD"].includes("ALL")){
      if(actionList[key]["REMOVE"].length == 0){
        this.creatCard(that, "ALL", key, "SelectAll", key +"_ALL", "Add")
      }

      else{
        this.creatCard(that,  this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key +"_ALL", "Add all except")
      }
    }
    else if (actionList[key]["ADD"].length > 0){
      if(actionList[key]["REMOVE"].length == 0){
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "Select", key +"_ADD", "Add")
      }
      else if (actionList[key]["REMOVE"].includes("ALL")){
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "Select", key +"_ALL", "Remove all except")
      }
      else{
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "Select", key +"_ADD", "Add")
        this.creatCard(that,  this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key +"_REMOVE", "Remove")

      }
    }
  }

  decisionPreparationFilterN(that, actionList){
    
    Object.keys(actionList).forEach(key => {
      actionList[key].forEach(element => {
        var attribute = ""
        Object.keys(element).filter(id => id != "Filter").forEach(subKey =>{
          if(attribute != ""){
            attribute += " and"
          }
          if(subKey == "LT"){
            attribute += " lower than " + element[subKey].toLocaleString('en-US')
          }
          else{
            attribute += " higher than " + element[subKey].toLocaleString('en-US')
          }
        })
        if(key == "ADD"){
          this.creatCard(that, attribute, element["Filter"], "FilterN", element["Filter"] + "_FilterN", "Select")
        }
        else{
          this.creatCard(that, attribute, element["Filter"], "FilterN", element["Filter"] + "_FilterN", "Remove")
        }
      })
      
    })
  }

  decisionPreparationFilterC(that, actionList){
    var keyList = ["State", "Energy Type", "Party of Governor", "Investment Type", "Year"]

    

    keyList.forEach(key => {
      var adding = []
      var removing = []
      adding = actionList["ADD"].filter(element => element["KEY"] == key)
      removing = actionList["REMOVE"].filter(element => element["KEY"] == key)
    
      if(adding.length == 0 && removing.length > 0){
        if (removing[0]["ID"].includes("ALL")){
          this.creatCard(that, "ALL", key, "SelectAll", key +"_ALL", "Remove")
        }
        else{
          this.creatCard(that,  this.makeCombination(removing[0]["ID"]), key, "Select", key +"_REMOVE", "Remove")
        }
      }
      else if (adding.length > 0 && adding[0]["ID"].includes("ALL")){
        if(removing.length == 0){
          this.creatCard(that, "ALL", key, "SelectAll", key +"_ALL", "Add")
        }
  
        else{
          this.creatCard(that,  this.makeCombination(removing[0]["ID"]), key, "Select", key +"_ALL", "Add all except")
        }
      }
      else if(adding.length > 0 ){
        if(removing.length == 0){
          this.creatCard(that,  this.makeCombination(adding[0]["ID"]), key, "Select", key +"_ADD", "Add")
        }
        else if (removing[0]["ID"].includes("ALL")){
          this.creatCard(that,  this.makeCombination(adding[0]["ID"]), key, "Select", key +"_ALL", "Remove all except")
        }
        else{
          this.creatCard(that,  this.makeCombination(adding[0]["ID"]), key, "Select", key +"_ADD", "Add")
          this.creatCard(that,  this.makeCombination(removing[0]["ID"]), key, "Select", key +"_REMOVE", "Remove")
  
        }
      }

    
  })
  }

  decisionPreparationEncoding(that, key, actionList){
    if(actionList[key]["ADD"].length == 0 && actionList[key]["REMOVE"].length > 0){
      if (actionList[key]["REMOVE"].includes("ALL")){
        this.creatCard(that, "ALL", key, "SelectAllEncoding", key +"_ALL", "Remove")
      }
      else{
        this.creatCard(that,  this.makeCombination(actionList[key]["REMOVE"]), key, "SelectEncoding", key +"_REMOVE", "Remove")
      }
    }
    else if (actionList[key]["ADD"].length > 0){
      if(actionList[key]["REMOVE"].length == 0){
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key +"_ADD", "Add")
      }
      else if (actionList[key]["REMOVE"].includes("ALL")){
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key +"_ALL", "Remove all except")
      }
      else{
        this.creatCard(that,  this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key +"_ADD", "Add")
        this.creatCard(that,  this.makeCombination(actionList[key]["REMOVE"]), key, "SelectEncoding", key +"_REMOVE", "Remove")

      }
    }
  }


  makeCombination(arr) {
    if (arr.length === 1) return arr[0];
    const firsts = arr.slice(0, arr.length - 1);
    const last = arr[arr.length - 1];
    return firsts.join(', ') + ' and ' + last;
  }




}







