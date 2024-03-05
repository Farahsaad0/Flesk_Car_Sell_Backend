import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Importer useNavigate
import VerificationPage from "./verificationPage";
import styles from "./styles.module.css";

const Signup = () => {
  const [data, setData] = useState({
    Prenom: "",
    Nom: "",
    Email: "",
    Password: "",
    Role: "",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate(); // Utiliser useNavigate pour la navigation

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8000/register";
      const { data: res } = await axios.post(url, data);
      
      if (data.Role === "Expert") {
        setMsg("Votre compte est en attente d'approbation par l'administrateur.");
      } else {
        setIsRegistered(true); // Définir l'état de la validation sur true
        setMsg(res.message);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.signup_container}>
      {isRegistered ? (
        <VerificationPage
          email={data.Email}
          onSuccess={() => navigate("/login")} // Utiliser navigate pour la navigation
        />
      ) : (
        <div className={styles.signup_form_container}>
          <div className={styles.left}>
            <h1>Bienvenue</h1>
            <Link to="/login">
              <button type="button" className={styles.white_btn}>
                Se connecter
              </button>
            </Link>
          </div>
          <div className={styles.right}>
            <form className={styles.form_container} onSubmit={handleSubmit}>
              <h1>Créer Compte</h1>
              <input
                type="text"
                placeholder="Prenom"
                name="Prenom"
                onChange={handleChange}
                value={data.Prenom}
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Nom"
                name="Nom"
                onChange={handleChange}
                value={data.Nom}
                required
                className={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                name="Email"
                onChange={handleChange}
                value={data.Email}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Mot de passe"
                name="Password"
                onChange={handleChange}
                value={data.Password}
                required
                className={styles.input}
              />
              <div className={styles.radio_group}>
                <label>
                  <input
                    type="radio"
                    name="Role"
                    value="Acheteur"
                    onChange={handleChange}
                    checked={data.Role === "Acheteur"}
                  />
                  Acheteur
                </label>
                <label>
                  <input
                    type="radio"
                    name="Role"
                    value="Vendeur"
                    onChange={handleChange}
                    checked={data.Role === "Vendeur"}
                  />
                  Vendeur
                </label>
                <label>
                  <input
                    type="radio"
                    name="Role"
                    value="Expert"
                    onChange={handleChange}
                    checked={data.Role === "Expert"}
                  />
                  Expert
                </label>
              </div>
              {error && <div className={styles.error_msg}>{error}</div>}
              {msg && <div className={styles.success_msg}>{msg}</div>}
              <button type="submit" className={styles.green_btn}>
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
