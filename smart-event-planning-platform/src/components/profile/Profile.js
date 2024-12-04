import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Navbar.css';
import './Profile.css';
import uk from '../../assets/uk.png';
import HomeIcon from '@mui/icons-material/Home';
import { useParams } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';

function Profile() {
  const { userId } = useParams(); // URL'deki userId'yi al
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null); // Kullanıcı verisi
  const [error, setError] = useState(null); // Hata durumu
  const [isLoading, setIsLoading] = useState(true); // Yüklenme durumu
  const [editingField, setEditingField] = useState(null); // Hangi alan düzenleniyor
  const [, setSelectedFile] = useState(null); // Yüklenen dosya

  useEffect(() => {
    // Kullanıcı verisini al
    axios
      .get(`/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setUser(response.data); // Kullanıcı verisini kaydet
        setIsLoading(false);   // Yüklenme durumunu güncelle
      })
      .catch((err) => {
        console.error("Kullanıcı verisi alınırken hata:", err);
        setError("Kullanıcı verisi alınamadı.");
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleProfile = () => {
    window.location.href = `/profile/${userId}`;
  };

  const translationMap = {
    username: 'Kullanıcı Adı',
    firstName: 'İsim',
    lastName: 'Soyisim',
    dateOfBirth: 'Doğum Tarihi',
    gender: 'Cinsiyet',
    email: 'E-posta',
    phoneNumber: 'Telefon',
    interests: 'İlgi Alanları',
    location: 'Lokasyon'
  };

  const handleEditClick = (field) => {
    setEditingField(field); // Düzenlenecek alanı ayarla
  };

  const handleInputChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser,
      [editingField]: e.target.value,
    }));
  };

  const handleSave = () => {
    setEditingField(null); // Düzenleme bitti
  };

  const handleUpdate = () => {
    const updatedUser = { ...user };

    axios
      .put(`/users/${userId}`, updatedUser, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setUser(response.data);
        alert('Kullanıcı bilgileri güncellendi!');
      })
      .catch((err) => {
        console.error("Güncelleme hatası:", err);
        alert('Kullanıcı bilgileri güncellenirken hata oluştu.');
      });
  };

  const handlePhotoClick = () => {
    document.getElementById('photoInput').click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // FormData oluştur ve fotoğrafı yükle
      const formData = new FormData();
      formData.append('profilePicture', file);

      axios
        .post(`/users/${userId}/uploadProfilePicture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          setUser((prevUser) => ({
            ...prevUser,
            profilePicturePath: response.data.profilePicturePath,
          }));
          alert('Profil fotoğrafı güncellendi!');
        })
        .catch((err) => {
          console.error('Fotoğraf yükleme hatası:', err);
          alert('Profil fotoğrafı yüklenirken bir hata oluştu.');
        });
    }
  };

  return (
    <div className="">
      {/* Navbar Bileşeni */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={uk} alt="Profile" className="profile-photo" />
          <HomeIcon className="profile-photo" onClick={() => window.location.href = `/home/${userId}`}/>
          <button className="home-button" onClick={() => window.location.href = `/home/${userId}`}>Home</button>
        </div>
        <div className="navbar-right">
          <button className="my-events-button" onClick={() => window.location.href = `/profile/eventprofile/${userId}`}>Etkinlikler</button>
          <div className="profile-menu">
            <img
              src={`/${user.profilePicturePath}`}
              alt="Profile"
              className="profile-photo"
              onClick={toggleDropdown}
            />
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <button onClick={handleProfile}>Profilim</button>
              <button onClick={handleLogout}>Çıkış</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Kullanıcı Bilgileri */}
      <div className="card-container">
        <div className="profile-gap">
          <img
            src={`/${user.profilePicturePath}`}
            alt="Profile"
            className="profile-photo-update"
            onClick={handlePhotoClick} // Tıklandığında dosya seçici açılır
          />
          <input
            id="photoInput"
            type="file"
            style={{ display: 'none' }}
            onChange={handlePhotoChange} // Dosya seçimi yapılınca çağrılır
          />
          <h3 className="profile-name">{user?.firstName} {user?.lastName}</h3>
        </div>

        <div className="profile-info">
          {Object.keys(translationMap).map((field) => (
            <p key={field}>
              <strong>{translationMap[field]}:</strong>
              {editingField === field ? (
                <>
                  <input
                    type="text"
                    defaultValue={user?.[field]}
                    onChange={handleInputChange}
                  />
                  <button onClick={handleSave}>Kaydet</button>
                </>
              ) : (
                <>
                  <span>{user?.[field]}</span>
                  <EditIcon
                    className="edit-icon"
                    onClick={() => handleEditClick(field)}
                  />
                </>
              )}
            </p>
          ))}
        </div>
        
        {/* Güncelleme Butonu */}
        <button className="profile-update-button" onClick={handleUpdate}> Bilgileri Güncelle </button>
      </div>
    </div>
  );
}

export default Profile;
