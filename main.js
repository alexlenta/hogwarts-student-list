// starts when DOM is loaded to make sure all the elements are in place
document.addEventListener("DOMContentLoaded", main);

let listContainerDiv;
let filterButtons;
let expellButtons;
let expelledNr;
let studentList = [];
let houseFilter = "";
let sortButtons;

// house name values
const houseList = ["", "Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
const houseImgList = [
  "",
  "gryffindor.png",
  "hufflepuff.png",
  "ravenclaw.png",
  "slytherin.png"
];

function main() {
  console.log("page loaded");

  // hold references to html elements
  listContainerDiv = document.getElementsByClassName("list-container")[0];
  filterButtons = document.getElementsByClassName("filter-btn");
  expelledNr = document.getElementById("expelled-nr");
  sortButtons = document.getElementsByClassName("sort-btn");

  // transforming a HTMLCollection to an array of elements
  filterButtons = [].slice.call(filterButtons);

  filterButtons.forEach(function(filterButton, buttonIndex) {
    filterButton.addEventListener("click", function() {
      filterBtnEventListener(buttonIndex);
    });
  });

  sortButtons = [].slice.call(sortButtons);

  sortButtons[0].addEventListener("click", function() {
    sortList("firstName");
  });

  sortButtons[1].addEventListener("click", function() {
    sortList("lastName");
  });

  // load the list and display it
  loadStudentList().then(function(rawStudentList) {
    studentList = rawStudentList.map(parseStudent);
    renderStudentList(studentList);
  });
}

// get the student list from API
function loadStudentList() {
  return fetch("students1991.json").then(function(res) {
    // parse the result data
    return res.json();
  });
}

// model for creating student objects
const StudentModel = {
  firstName: "",
  secondName: "",
  lastName: "",
  house: "",
  id: ""
};

// parse raw student from api to my student object
function parseStudent(student) {
  const newStudent = Object.create(StudentModel);

  // set student first, second?, last name
  const nameList = student.fullname.split(" ");
  newStudent.firstName = nameList[0];

  if (nameList.length > 2) {
    newStudent.secondName = nameList[1];
    newStudent.lastName = nameList[2];
  } else {
    newStudent.lastName = nameList[1];
  }

  newStudent.id = student.fullname;
  newStudent.house = student.house;

  return newStudent;
}

// display the student in html
function renderStudent(student) {
  const imgIndex = houseList.indexOf(student.house);
  console.log(imgIndex);

  return `
    <div class="student-item">
      <div class="house-img-box" style="background-image: url('${
        houseImgList[imgIndex]
      }')"></div>
      <div>House: ${student.house}</div>
      <div>First name: ${student.firstName}</div>
      ${
        student.secondName.length
          ? "<div>Second name: " + student.secondName + "}</div>"
          : ""
      }
      <div>Last name: ${student.lastName}</div>
      <br>

      <div>
        <button class="expell-btn" data-target="${student.id}">Expell</button>
      </div>
    </div>`;
}

// display the student list
function renderStudentList(rawList) {
  let list = rawList;

  // check for house filter
  if (houseFilter.length > 0) {
    list = list.filter(function(student) {
      return student.house === houseFilter;
    });
  }

  // render students in html
  listContainerDiv.innerHTML = "";
  list.forEach(function(student) {
    listContainerDiv.innerHTML += renderStudent(student);
  });

  // add click handlers for 'Expell' buttons
  expellButtons = document.getElementsByClassName("expell-btn");
  expellButtons = [].slice.call(expellButtons);
  expellButtons.forEach(function(expellBtn) {
    expellBtn.addEventListener("click", expellBtnEventListener);
  });

  // update the counts
  renderListsCount();
}

// filter button
// set the filter, then render the list
function filterBtnEventListener(buttonIndex) {
  houseFilter = houseList[buttonIndex];
  renderStudentList(studentList);
}

// expell button
// remove the student from list, update the expelled count
function expellBtnEventListener() {
  const id = this.getAttribute("data-target");
  const index = studentList.findIndex(function(student) {
    return student.id === id;
  });

  if (index > -1) {
    studentList.splice(index, 1);
    expelledNr.innerHTML = Number(expelledNr.innerHTML) + 1;
    renderStudentList(studentList);
  }
}

// sort the list by key (firstName, lastName), then render the new list
function sortList(key) {
  const sortedList = studentList.sort(function(prevStudent, currentStudent) {
    if (prevStudent[key] === currentStudent[key]) {
      return 0;
    }

    if (prevStudent[key] > currentStudent[key]) {
      return 1;
    } else {
      return -1;
    }
  });

  renderStudentList(sortedList);
}

// display the student count for each house
function renderListsCount() {
  filterButtons.forEach(function(filterBtn, buttonIndex) {
    const spanElement = filterBtn.querySelector(".house-count");
    let count;

    if (buttonIndex === 0) {
      count = studentList.length;
    } else {
      // count for the filtered list by house name
      const filteredList = studentList.filter(function(student) {
        return student.house === houseList[buttonIndex];
      });
      count = filteredList.length;
    }

    spanElement.innerHTML = `(${count})`;
  });
}
