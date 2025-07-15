let lists = JSON.parse(localStorage.getItem("todoLists")) || [];

function saveToLocalStorage() {
  localStorage.setItem("todoLists", JSON.stringify(lists));
}

function renderLists() {
  const container = document.getElementById("lists-container");
  container.innerHTML = "";

  const sortedLists = [...lists].sort((a, b) => b.pinned - a.pinned);

  sortedLists.forEach((list) => {
    const listDiv = document.createElement("div");
    listDiv.className = "list";

    const headerDiv = document.createElement("div");
    headerDiv.style.display = "flex";
    headerDiv.style.justifyContent = "space-between";
    headerDiv.style.alignItems = "center";
    headerDiv.style.marginBottom = "10px";

    const title = document.createElement("h2");
    title.textContent = list.name;
    title.style.cursor = "pointer";
    title.title = "Click to rename";
    title.onclick = () => renameList(list.id);

    const buttonsDiv = document.createElement("div");

    const pinBtn = document.createElement("button");
    pinBtn.textContent = list.pinned ? "Unpin" : "📌 Pin";
    pinBtn.style.marginRight = "10px";
    pinBtn.onclick = () => togglePin(list.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.onclick = () => deleteList(list.id);

    buttonsDiv.appendChild(pinBtn);
    buttonsDiv.appendChild(deleteBtn);
    headerDiv.appendChild(title);
    headerDiv.appendChild(buttonsDiv);
    listDiv.appendChild(headerDiv);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Add new task";
    input.onkeypress = function (e) {
      if (e.key === "Enter") {
        addTask(list.id, input.value);
        input.value = "";
      }
    };
    listDiv.appendChild(input);

    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    taskContainer.dataset.listId = list.id;
    taskContainer.ondrop = handleDrop;
    taskContainer.ondragover = handleDragOver;

    list.tasks.forEach((task, taskIndex) => {
      const taskDiv = document.createElement("div");
      taskDiv.className = "task";
      taskDiv.draggable = true;
      taskDiv.dataset.index = taskIndex;
      taskDiv.ondragstart = handleDragStart;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.onchange = () => toggleTaskById(list.id, taskIndex);
      taskDiv.appendChild(checkbox);

      const span = document.createElement("span");
      span.textContent = task.name;
      if (task.completed) span.classList.add("completed");
      taskDiv.appendChild(span);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteTaskById(list.id, taskIndex);
      taskDiv.appendChild(deleteBtn);

      taskContainer.appendChild(taskDiv);
    });

    listDiv.appendChild(taskContainer);
    container.appendChild(listDiv);
  });
}


function generateId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

function createList() {
  const input = document.getElementById("new-list-name");
  const name = input.value.trim();
  if (name) {
    lists.push({ id: generateId(), name, tasks: [], pinned: false });
    input.value = "";
    saveToLocalStorage();
    renderLists();
  }
}

function togglePin(id) {
  const list = lists.find((l) => l.id === id);
  list.pinned = !list.pinned;
  saveToLocalStorage();
  renderLists();
}

function renameList(id) {
  const list = lists.find((l) => l.id === id);
  const newName = prompt("Enter new list name:", list.name);
  if (newName && newName.trim()) {
    list.name = newName.trim();
    saveToLocalStorage();
    renderLists();
  }
}

function deleteList(id) {
  if (confirm("Delete this list and all its tasks?")) {
    lists = lists.filter((l) => l.id !== id);
    saveToLocalStorage();
    renderLists();
  }
}

function addTask(id, taskName) {
  const list = lists.find((l) => l.id === id);
  if (taskName.trim()) {
    list.tasks.push({ name: taskName.trim(), completed: false });
    saveToLocalStorage();
    renderLists();
  }
}

function toggleTaskById(id, taskIndex) {
  const list = lists.find((l) => l.id === id);
  list.tasks[taskIndex].completed = !list.tasks[taskIndex].completed;
  saveToLocalStorage();
  renderLists();
}

function deleteTaskById(id, taskIndex) {
  const list = lists.find((l) => l.id === id);
  list.tasks.splice(taskIndex, 1);
  saveToLocalStorage();
  renderLists();
}

let dragStartIndex = null;

function handleDragStart(e) {
  dragStartIndex = Number(e.currentTarget.dataset.index);
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  const listId = e.currentTarget.dataset.listId;
  const dropIndex = Number(e.target.closest(".task")?.dataset.index);
  if (isNaN(dropIndex)) return;

  const list = lists.find((l) => l.id === listId);
  const draggedTask = list.tasks.splice(dragStartIndex, 1)[0];
  list.tasks.splice(dropIndex, 0, draggedTask);

  saveToLocalStorage();
  renderLists();
}

window.onload = renderLists;
