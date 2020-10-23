import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button, Container, Typography } from "@material-ui/core";
import { db, storage, serviceCollection } from "../../lib/firebase";
import axios from "axios";
import auth from "../../lib/auth";
import BackupIcon from "@material-ui/icons/Backup";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: `${window.innerHeight - 100}px`,
    textAlign: "center",
  },
  spacing: {
    margin: "20px 0",
  },
  form: {
    width: "40%",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    height: "55%",
    justifyContent: "space-around",
  },
  upload: {
    margin: "20px auto",
  },
}));

export default function ContainedButtons({ history }) {
  const classes = useStyles();
  const [image, setImage] = React.useState(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [url, setUrl] = React.useState("");

  const input = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("/companies/services", {
        service_name: name,
        service_description: description,
        // companyId: '7DK37g0zVmNowHax6cEJ'
        companyId: auth.getUserId(),
      })
      .then((res) => {
        console.log(res.data);
        history.push("/companyDashboard/services");
      })
      .catch((error) => {
        alert(error.message);
      });

    if (image) {
      const uploadTask = storage.ref(`services/${image.name}`).put(image);

      uploadTask.on(
        "state_changed",
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              setUrl(url);
            });
        }
      );
    }

    setName("");
    setDescription("");
  };

  const HandleChange = (e) => {
    //setDataChange(true);
    const image = e.target.files;
    const picture = new FormData();
    picture.append("owner", auth.getUserId());
    picture.append("picture", image[0], image[0].name);

    console.log(picture);

    axios.patch(`/service/:id/document`, picture, {
      headers: { Authorization: `Bearer ${auth.getToken()}` },
    });
  };

  return (
    <Container className={classes.container}>
      <form
        className={classes.form}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Typography variant="h4"> SERVICES</Typography>
        <TextField
          className={classes.spacing}
          id="outlined-basic"
          label="Service name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          className={classes.spacing}
          id="outlined-basic"
          label="Service description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          ref={input}
          style={{ display: "none" }}
          onChange={(e) => HandleChange(e)}
          type="file"
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={() => input.current.click()}
        >
          <BackupIcon />
          UPLOAD IMAGES
        </Button>

        <Button
          className={classes.spacing}
          type="submit"
          variant="contained"
          color="primary"
        >
          SAVE
        </Button>

        <Link to="/companyDashboard/services">
          <Button variant="outlined" color="primary">
            Back
          </Button>
        </Link>
      </form>
    </Container>
  );
}
