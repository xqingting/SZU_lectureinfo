document.querySelector("body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(3) > td > table > tbody")
let arr = tbody.querySelectorAll('tr');
let raw_data
for (let i = 0; i < arr.length; i++) {
  raw_data += arr[i].innerText + '\n';
}

let campus = ''; //默认粤海，可填 丽湖、两校区
let days = 0; //默认目前， 可填1-n天
let department = '传播学院、人文学院、外国语学院'//默认全部学院，可填单个或学院列表，若为单个输出格式小有改变
let not_department = '微纳光电子学研究院、数学与统计学院'//默认不排除，可填单个或学院列表

GetDocu(raw_data, campus, days, department, not_department);

function GetDocu(raw_data, campus, days, department, not_department) {
  let parse_data = parseData(raw_data)
  let data = select_data(parse_data, campus, days, department, not_department)
  return output(data, campus, days, department)
  function parseData(data) {
    // Split data into lines
    let lines = data.split('\n');

    // Initialize an empty array to store the events
    let events = [];

    // For each line, split into fields and create an event object
    for (let line of lines) {
      let fields = line.split('\t');

      // Ignore empty lines
      if (fields.length < 5) {
        continue;
      }

      // Create an event object
      let event = {
        serial: fields[0].trim(),
        campus: fields[1].split('｜')[0].trim(),
        building: fields[1].split('｜')[1].trim(),
        time: new Date('2023-' + fields[2].trim().replace(/\//g, '-')),
        topic: fields[3].trim(),
        department: fields[4].trim()
      };

      // Add the event object to the array
      events.push(event);
    }

    // Return the array of event objects
    return events;
  }


  function select_data(data, campus = '粤海', days = 0, department = '', not_department = '') {
    // Initialize an empty array to store the selected events
    let selected_events = [];

    // Get the current date and time
    let now = new Date();
    now.setHours(0, 0, 0, 0);  // Reset time to 00:00:00

    // Calculate the end time based on the number of days
    let end = new Date(now);
    end.setDate(now.getDate() + days);
    end.setHours(23, 59, 59, 999);  // Set time to 23:59:59

    // For each event in the data
    for (let event of data) {
      // If the event is on the specified campus and in the future, add it to the selected events
      //console.log(event.department, department.includes(event.department))
      if ((event.campus === '两校区' || event.campus === campus) && event.time >= now &&
        (days === 0 || (event.time <= end)) &&
        (department === '' || department.includes(event.department)) &&
        (not_department === '' || !not_department.includes(event.department))) {
        selected_events.push(event);
      }
    }

    // Return the array of selected events
    return selected_events;
  }

  function output(data, campus = '两校区', days = '0', department = '') {
    // Initialize an empty string to store the output
    if (data.length === 0) {
      return '无讲座'
    }
    let output_string
    if (days === 1) {//今天不需要标注日期
      output_string = `今天${campus}的讲座如下：\n`;
    } else if (days === 0) {
      output_string = `目前${campus}的讲座如下：\n`;
    } else {
      output_string = `${days}日内${campus}的讲座如下：\n`;
    }
    // For each event in the data
    for (let [index, event] of data.entries()) {
      index += 1
      let time = formatDate(event.time);
      // Add the event details to the output string
      if (department != '' && !department.includes("|") && !department.includes("、")) {
        //确定了哪个发文单位
        output_string += `${index}.${event.topic.replace('·', '')}\n`;
      } else {
        output_string += `${index}.${event.department}\n`;
        output_string += `讲座主题：${event.topic.replace('·', '')}\n`;
      }
      if (campus === '两校区') {
        output_string += `信息：${event.campus}.${event.building} | ${time}\n`;
      } else {
        output_string += `信息：${event.building} | ${time}\n`;
      }
      output_string += '\n';  // Add an extra newline for readability
    }

    // Return the output string
    return output_string;
  }

  function formatDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;  // JavaScript months are 0-indexed
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Ensure all parts are at least two digits
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Format the date and time in the desired format
    let formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }
}