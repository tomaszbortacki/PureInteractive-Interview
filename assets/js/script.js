window.addEventListener("DOMContentLoaded", () => {
  
  const getImageUrl = (temp, rain) => {
    const path = "assets/img";
    if(temp < 10 && rain >= 0.2) {
      return `${path}/5.png`;
    } else if(temp < 10) {
      return `${path}/3.png`;
    } else {
      return `${path}/4.png`;
    }
  }
  
  const getHour = (num) => {
    num = num % 24;
    let hour = `${num < 10 ? `0${num}` : num}:00`;
    return hour || 0;
  };

  const getAngle = (wind) => {
    const trans = "transform:";
    let deg = 0;

    if (wind === "Północny") {
      deg = -90;
    } else if (wind === "Południowy") {
      deg = 90;
    } else if (wind === "Zachodni") {
      deg = 180;
    }

    if(wind === "Pn.-Zach.") {
      deg = Math.floor(Math.random() * (270 - 190)) + 190;
    } else if (wind === "Pn.-Wsch.") {
      deg = Math.floor(Math.random() * (370 - 280)) + 280;
    } else if (wind === "Pd.-Zach.") {
      deg = Math.floor(Math.random() * (170 - 100)) + 100;
    } else if (wind === "Pd.-Wsch.") {
      deg = Math.floor(Math.random() * (80 - 10)) + 10;
    } 

    return `${trans} rotate(${deg}deg);`;
  }

  const getWindType = (vel) => {

    if(vel > 25) return "Mocny"
    if(vel > 18) return "Umiar."

    return "Słaby";
  } 

  const generateWave = (els, strenght, type) => {
    const elsVals = {
      min: 99999,
      max: 0,
    }

    els.each(function() {
      const val = parseInt($(this).attr(`data-${type}`));
      if(val < elsVals.min) elsVals.min = val;
      if(val > elsVals.max) elsVals.max = val;
    })

    const max = elsVals.max - elsVals.min;

    els.each(function() {
      const val = elsVals.max - parseInt($(this).attr(`data-${type}`));
      const perc = val * 100 / max * strenght;
      $(this).children().css("transform", `translateY(${perc}%)`);
    });
  }

  const generateAngle = (els) => {
    for(let i=0; i<els.length-1; i++) {
      const curr = $(els[i]).children();
      const next = $(els[i+1]).children();
      const data = {
        w: curr.width() * 2,
        h: next.position().top - curr.position().top
      }

      const angle = (data.h / data.w * 100).toFixed(2);
      const styles = curr.attr("style");
      curr.attr("style", `${styles} --a: ${angle}deg;`);
    }
  }

  const days = ["Dzisiaj", "Jutro"];

  const weatherGenerator = (el, num, { temp, rain, wind, windVel, press }, last) => {
    rain = parseFloat(rain).toFixed(1);

    el.append(`
      <section class="hour">
        <ul>
          <li class="day">${(num % 24 === 0) ? days[0] : ""}</li>
          <li class="current-hour">${getHour(num)}</li>
          <li class="img">
            <img src="${getImageUrl(temp, rain)}"/>
          </li>
          <li class="temp" data-temp="${temp}">
            <div>
              <p ${(last) ? "class='last'" : ""}>
                <span>${temp}°</span>
              </p>
            </div>
          </li>
          <li class="rain">
            ${
              rain >= 0.11
                ? `
                  <p>${rain} mm</p>
                  <div style="--h:${rain * 25}%;"></div>
                `
                : ""
            }
          </li>
          <li class="dark wind">
            <img src="assets/img/arrow.png" style="${getAngle(wind)}"/>
            <p>${wind}</p>
          </li>
          <li class="dark wind-vel">
            <p>${getWindType(windVel)}</p>
            <h4>${windVel} km/h</h4>
          </li>
          <li class="press" data-press="${press}">
            <div>
              <p ${(last) ? "class='last'" : ""}>${press} hPa</p>
            </div>
          </li>
        </ul>
      </section>
    `);

    if(num % 24 === 0) days.shift();
  };

  const generateNumbers = (num, i, str, floor) => {
    if (i % 24 > 12) num -= Math.random() * (0 - str) + str;
    else num += Math.random() * str;

    if (floor) num = Math.floor(num);

    return num;
  };

  const weather = $("[data-generate-weather]");
  if (weather.length > 0) {
    const numbers = parseInt(weather.attr("data-generate-weather"));

    const windType = [
      "Pn.-Zach.",
      "Północny",
      "Pn.-Wsch.",
      "Wschodni",
      "Pd.-Wsch.",
      "Południowy",
      "Pd.-Zach.",
      "Zachodni",
    ];

    const data = {
      temp: Math.floor(Math.random() * (8 - 4) + 4),
      rain: Math.abs(Math.random()),
      wind: windType[Math.floor(Math.random() * 8)],
      windVel: Math.floor(Math.random() * (8 - 4) + 4),
      press: Math.floor(Math.random() * (1014 - 1012) + 1012),
    };

    for (let i = 0; i < numbers; i++) {
      data.temp = generateNumbers(data.temp, i, 3, true);
      data.rain = generateNumbers(data.rain, i, 0.08, false);
      data.wind = windType[Math.floor(Math.random() * 8)];
      data.windVel = Math.abs(generateNumbers(data.windVel, i, 5, true));
      data.press = generateNumbers(data.press, i, 3, true);

      weatherGenerator(weather, i, data, (i === numbers - 1) ? true : false);
    }

    weather.slick({
      infinite: false,
      slidesToShow: 12,
      swipeToSlide: true,
      dots: false,
      arrows: true,
      appendArrows: weather.prev(),
    });

    const temp = $("[data-temp]");
    if(temp.length>0) {
      generateWave(temp, 2, "temp");
      generateAngle(temp);
    }

    const press = $("[data-press]");
    if(press.length>0) {
      generateWave(press, 1, "press");
      generateAngle(press);
    }
  }
});
