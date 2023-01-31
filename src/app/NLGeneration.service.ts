import { Injectable } from '@angular/core';

@Injectable()
export class NLGeneration {

  constructor() { }

  public possibleActions = []
  public selectedAmbiguity = 0
  public encodingKeys = ["x-Axis", "Values", "Color"]
  public additionalKeys = ["Highlight", "ColorHighlight", "Filter"]

  initializeUnderstandingDisplay(that, actionList, mode, ambiguity) {

    if (mode == "training" && document.getElementById("Representation_" + ambiguity)) {
      document.getElementById("Representation_" + ambiguity).parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0]["style"]["background"] = "#a6192e"
      document.getElementById("Representation_" + ambiguity).parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0]["style"]["color"] = "white"
      document.getElementById("Representation_" + ambiguity).parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0]["style"]["transition"] = "all 1s linear"
      that.training.actionScriptSize[ambiguity] = 0
      for (var i = document.getElementById("Representation_" + ambiguity).childNodes.length - 1; 0 <= i; i--) {
        var element = document.getElementById("Representation_" + ambiguity).childNodes[i];
        if (element["id"] != "DemonstrationGuide") {
          element.parentNode.removeChild(element);
        }

      }
    }
    if (mode == "reasoning") {

      for (var i = document.getElementById("ConditionGuide").parentNode.childNodes.length - 1; 0 <= i; i--) {
        var element = document.getElementById("ConditionGuide").parentNode.childNodes[i];
        if (element["id"] != "ConditionGuide") {
          element.parentNode.removeChild(element);
        }

      }
    }
    if (mode == "new") {

      for (var i = document.getElementById("currentScript").parentNode.childNodes.length - 1; 0 <= i; i--) {
        var element = document.getElementById("currentScript").parentNode.childNodes[i];
        if (element["id"] != "currentScript") {
          element.parentNode.removeChild(element);
        }

      }
    }
    if (mode == "existing") {

      for (var i = document.getElementById("existingScript").parentNode.childNodes.length - 1; 0 <= i; i--) {
        var element = document.getElementById("existingScript").parentNode.childNodes[i];
        if (element["id"] != "existingScript") {
          element.parentNode.removeChild(element);
        }

      }
    }
    Object.keys(actionList).forEach(key => {
      if (key == "VISUALIZATION") {
        for (var element in actionList["VISUALIZATION"]["ADD"]) {
          this.creatCard(that, actionList["VISUALIZATION"]["ADD"][element] + " chart", "Visualization", "Change", "VISUALIZATION", null, mode, ambiguity)
        }


      }
      if (key == "Aggregate") {
        for (var element in actionList["Aggregate"]["ADD"]) {
          if (actionList["Aggregate"]["ADD"][element]["KEY"] == "ALL") {
            this.creatCard(that, actionList["Aggregate"]["ADD"][element]["ID"], "Aggregate of all Values", "Change", "Aggregate_" + actionList["Aggregate"]["ADD"][element]["KEY"], null, mode, ambiguity)
          }
          else {
            this.creatCard(that, actionList["Aggregate"]["ADD"][element]["ID"], "Aggregate of " + actionList["Aggregate"]["ADD"][element]["KEY"], "Change", "Aggregate_" + actionList["Aggregate"]["ADD"][element]["KEY"], null, mode, ambiguity)
          }
        }
      }

      if (this.encodingKeys.includes(key)) {
        this.decisionPreparationEncoding(that, key, actionList, mode, ambiguity)
      }

      if (this.additionalKeys.includes(key)) {
        this.decisionPreparation(that, key, actionList, mode, ambiguity)
      }

      if (key == "FilterC") {
        this.decisionPreparationFilterC(that, actionList[key], mode, ambiguity)
      }

      if (key == "FilterN") {
        this.decisionPreparationFilterN(that, actionList[key], mode, ambiguity)
      }

    })

    if(mode == "training" && document.getElementById("Representation_" + ambiguity)){
      setTimeout(element => { document.getElementById("Representation_" + ambiguity).parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0]["style"]["background"] = "#f8f9fa"; document.getElementById("Representation_" + ambiguity).parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0]["style"]["color"] = "#6c757d"; 
    }, 1500)
    }

  }


  creatCard(that, attribute, target, type, id, verb, mode, ambiguity) {
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
    else if (type == "FilterN") {
      clone = document.getElementById('TemplateFilterN').cloneNode(true);
      clone.lastChild.parentElement.id = id
      clone.lastChild.parentElement.style["display"] = "block";
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText = verb
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[1].innerText = target
      clone.children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[2].innerText = attribute
    }

    clone.children[2].children[0].children[0].children[0].children[0].children[1].children[0].onclick = that.closeITLElement.bind(that);

    /*if (mode == "training" &&  document.getElementById("Representation_" + ambiguity) && document.getElementById("DemonstrationGuide")!.nextSibling) {
      that.training.actionScriptSize[ambiguity] += 1
      document.getElementById("DemonstrationGuide")!.parentNode!.insertBefore(clone, document.getElementById("DemonstrationGuide")!.nextSibling)
    }
    else*/ if (mode == "training" && document.getElementById("Representation_" + ambiguity)) {
      that.training.actionScriptSize[ambiguity] += 1
      document.getElementById("Representation_" + ambiguity).appendChild(clone)
    }
    else if (mode == "reasoning" && document.getElementById("ConditionGuide")!.nextSibling) {
      clone.className = "col-6"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("ConditionGuide")!.parentNode!.insertBefore(clone, document.getElementById("ConditionGuide")!.nextSibling)
    }
    else if (mode == "reasoning") {
      clone.className = "col-6"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("ConditionGuide")!.parentNode!.appendChild(clone)
    }
    else if (mode == "new" && document.getElementById("currentScript")!.nextSibling) {
      clone.className = "col-12"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("currentScript")!.parentNode!.insertBefore(clone, document.getElementById("currentScript")!.nextSibling)
    }
    else if (mode == "new") {
      clone.className = "col-12"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("currentScript")!.parentNode!.appendChild(clone)
    }
    else if (mode == "existing" && document.getElementById("existingScript")!.nextSibling) {
      clone.className = "col-12"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("existingScript")!.parentNode!.insertBefore(clone, document.getElementById("existingScript")!.nextSibling)
    }
    else if (mode == "existing") {
      clone.className = "col-12"
      clone.id = ""
      clone.children[2].children[0].children[0].children[0].children[0].children[1].style["display"] = 'none'
      document.getElementById("existingScript")!.parentNode!.appendChild(clone)
    }



  }

  decisionPreparation(that, key, actionList, mode, ambiguity) {
    if (actionList[key]["ADD"].length == 0 && actionList[key]["REMOVE"].length > 0) {
      if (actionList[key]["REMOVE"].includes("ALL")) {
        this.creatCard(that, "ALL", key, "SelectAll", key + "_ALL", "Remove", mode, ambiguity)
      }
      else {
        this.creatCard(that, this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key + "_REMOVE", "Remove", mode, ambiguity)
      }
    }
    else if (actionList[key]["ADD"].length > 0 && actionList[key]["ADD"].includes("ALL")) {
      if (actionList[key]["REMOVE"].length == 0) {
        this.creatCard(that, "ALL", key, "SelectAll", key + "_ALL", "Add", mode, ambiguity)
      }

      else {
        this.creatCard(that, this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key + "_ALL", "Add all except", mode, ambiguity)
      }
    }
    else if (actionList[key]["ADD"].length > 0) {
      if (actionList[key]["REMOVE"].length == 0) {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "Select", key + "_ADD", "Add", mode, ambiguity)
      }
      else if (actionList[key]["REMOVE"].includes("ALL")) {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "Select", key + "_ALL", "Remove all except", mode, ambiguity)
      }
      else {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "Select", key + "_ADD", "Add", mode, ambiguity)
        this.creatCard(that, this.makeCombination(actionList[key]["REMOVE"]), key, "Select", key + "_REMOVE", "Remove", mode, ambiguity)

      }
    }
  }

  decisionPreparationFilterN(that, actionList, mode, ambiguity) {

    Object.keys(actionList).forEach(key => {
      actionList[key].forEach(element => {
        var attribute = ""
        Object.keys(element).filter(id => id != "Filter").forEach(subKey => {
          if (attribute != "") {
            attribute += " and"
          }
          if (subKey == "LT") {
            attribute += " lower than " + element[subKey].toLocaleString('en-US')
          }
          else {
            attribute += " higher than " + element[subKey].toLocaleString('en-US')
          }
        })
        if (key == "ADD") {
          this.creatCard(that, attribute, element["Filter"], "FilterN", element["Filter"] + "_FilterN", "Select", mode, ambiguity)
        }
        else {
          this.creatCard(that, attribute, element["Filter"], "FilterN", element["Filter"] + "_FilterN", "Remove", mode, ambiguity)
        }
      })

    })
  }

  decisionPreparationFilterC(that, actionList, mode, ambiguity) {
    var keyList = ["State", "Energy Type", "Party of Governor", "Investment Type", "Year"]



    keyList.forEach(key => {
      var adding = []
      var removing = []
      adding = actionList["ADD"].filter(element => element["KEY"] == key)
      removing = actionList["REMOVE"].filter(element => element["KEY"] == key)

      if (adding.length == 0 && removing.length > 0) {
        if (removing[0]["ID"].includes("ALL")) {
          this.creatCard(that, "ALL", key + " Filter", "SelectAll", key + "_ALL", "Remove", mode, ambiguity)
        }
        else {
          this.creatCard(that, this.makeCombination(removing[0]["ID"]), key + " Filter", "Select", key + "_REMOVE", "Remove", mode, ambiguity)
        }
      }
      else if (adding.length > 0 && adding[0]["ID"].includes("ALL")) {
        if (removing.length == 0) {
          this.creatCard(that, "ALL", key + " Filter", "SelectAll", key + "_ALL", "Add", mode, ambiguity)
        }

        else {
          this.creatCard(that, this.makeCombination(removing[0]["ID"]), key + " Filter", "Select", key + "_ALL", "Add all except", mode, ambiguity)
        }
      }
      else if (adding.length > 0) {
        if (removing.length == 0) {
          this.creatCard(that, this.makeCombination(adding[0]["ID"]), key + " Filter", "Select", key + "_ADD", "Add", mode, ambiguity)
        }
        else if (removing[0]["ID"].includes("ALL")) {
          this.creatCard(that, this.makeCombination(adding[0]["ID"]), key + " Filter", "Select", key + "_ALL", "Remove all except", mode, ambiguity)
        }
        else {
          this.creatCard(that, this.makeCombination(adding[0]["ID"]), key + " Filter", "Select", key + "_ADD", "Add", mode, ambiguity)
          this.creatCard(that, this.makeCombination(removing[0]["ID"]), key + " Filter", "Select", key + "_REMOVE", "Remove", mode, ambiguity)

        }
      }


    })
  }

  decisionPreparationEncoding(that, key, actionList, mode, ambiguity) {
    if (actionList[key]["ADD"].length == 0 && actionList[key]["REMOVE"].length > 0) {
      if (actionList[key]["REMOVE"].includes("ALL")) {
        this.creatCard(that, "ALL", key, "SelectAllEncoding", key + "_ALL", "Remove", mode, ambiguity)
      }
      else {
        this.creatCard(that, this.makeCombination(actionList[key]["REMOVE"]), key, "SelectEncoding", key + "_REMOVE", "Remove", mode, ambiguity)
      }
    }
    else if (actionList[key]["ADD"].length > 0) {
      if (actionList[key]["REMOVE"].length == 0) {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key + "_ADD", "Add", mode, ambiguity)
      }
      else if (actionList[key]["REMOVE"].includes("ALL")) {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key + "_ALL", "Remove all except", mode, ambiguity)
      }
      else {
        this.creatCard(that, this.makeCombination(actionList[key]["ADD"]), key, "SelectEncoding", key + "_ADD", "Add", mode, ambiguity)
        this.creatCard(that, this.makeCombination(actionList[key]["REMOVE"]), key, "SelectEncoding", key + "_REMOVE", "Remove", mode, ambiguity)

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







