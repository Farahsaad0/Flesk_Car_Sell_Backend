   
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";


const VerificationPage = ({ email, onSuccess }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8000/verify";
      const { data: res } = await axios.post(url, {
        email,
        verificationCode,
      });
      setMsg(res.message);
      onSuccess(); // Appel à la fonction onSuccess pour signaler la réussite de la vérification
      navigate('/login'); // Rediriger vers la page de connexion après la vérification réussie
    } catch (error) {
      setError("Code de vérification invalide.");
    }
  };

  return (
    <div className={styles.signup_container}>
      <form
        className={styles.form_container}
        onSubmit={handleVerificationSubmit}
      >
        <h1>Vérification de l'email</h1>
        <input
          type="text"
          placeholder="Code de vérification"
          name="verificationCode"
          onChange={(e) => setVerificationCode(e.target.value)}
          value={verificationCode}
          required
          className={styles.input}
        />
        {error && <div className={styles.error_msg}>{error}</div>}
        {msg && <div className={styles.success_msg}>{msg}</div>}
        <button type="submit" className={styles.green_btn}>
          Valider
        </button>
      </form>
    </div>
  );
};

export default VerificationPage;
