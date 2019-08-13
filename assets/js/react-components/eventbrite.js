import React from "react";

import Events from "./events";

class Eventbrite extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveEvents: [],
      completedEvents: []
    };
  }
  render() {
    const {liveEvents, completedEvents} = this.state;
    return (
      <div>
        <Events status="live" events={liveEvents}></Events>
        <Events status="completed" events={completedEvents}></Events>
      </div>
    );
  }
  dayOfWeekAsInteger(day) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
  }

  formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return `${this.dayOfWeekAsInteger(date.getDay())} - ${monthNames[monthIndex]} ${day}, ${year}`;
  }
  getEvents() {
    const url =
      "/.netlify/functions/eventbrite";
    const request = new Request(url);
    return fetch(request)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error("Something went wrong on api server!");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  transform(data) {
    const events = data.events.map((event) => {
      let image;
      if (event.logo && event.logo.original) {
        image = event.logo.original.url;
      }
      else {
        image = "/assets/img/banners/eventbrite.png";
      }
      return {
        name: event.name.text,
        photo_url: image,
        event_url: event.url,
        description: event.description.text,
        created: this.formatDate(new Date(event.start.utc))
      };
    });
    return events;
  }
  async componentDidMount() {
    try {
      const data = await this.getEvents();
      const events = {
        live: this.transform(data.live),
        completed: this.transform(data.completed)
      };
      this.setState({
        liveEvents: events.live,
        completedEvents: events.completed
      });
    }
    catch (e) {
      console.warn("there is an error");
    }
  }
}

export default Eventbrite;
