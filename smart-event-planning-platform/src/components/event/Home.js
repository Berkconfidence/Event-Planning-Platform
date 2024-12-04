import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Home.css';
import './Navbar.css';
import { useParams } from "react-router-dom";
import uk from '../../assets/uk.png'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';


const mapContainerStyle = {
  width: '100%',
  height: '250px',
};

function Home() {
  const { userId } = useParams(); // URL'deki userId'yi al
  const [events, setEvents] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null); // Kullanıcı verisi
  const [error, setError] = useState(null); // Hata durumu
  const [isLoading, setIsLoading] = useState(true); // Yüklenme durumu
  const [expandedCard, setExpandedCard] = useState(null);
  // Modal durumunu kontrol etmek için state
  const [isModalOpen, setModalOpen] = useState(false);  // Modal açma durumu
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    category: '',
  });

  // Etkinlikleri almak için API çağrısı
  useEffect(() => {
    axios.get(`/events/suggest/${userId}`)
      .then(response => {
        console.log(response.data);
        const eventsWithCoordinates = response.data.map(event => {
          return getCoordinates(event.location).then(coords => {
            return { ...event, latitude: coords.lat, longitude: coords.lng };
          });
        });

        Promise.all(eventsWithCoordinates).then(updatedEvents => {
          setEvents(updatedEvents);
        });
      })
      .catch(error => {
        console.error("Etkinlik bilgileri alınamadı", error);
      });
  }, [userId]);

  // Adresi koordinatlara çevirme işlemi
  const getCoordinates = async (address) => {
    const googleMapsApiKey = "";
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;

    try {
      const response = await axios.get(geocodeUrl);
      const location = response.data.results[0]?.geometry.location;
      if (location) {
        return { lat: location.lat, lng: location.lng };
      }
      return { lat: 0, lng: 0 }; // Eğer koordinatlar alınamazsa
    } catch (error) {
      console.error("Geocoding API hatası:", error);
      return { lat: 0, lng: 0 }; // Hata durumunda koordinatlar döndürülür
    }
  };

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

  if (events.length === 0) {
    return <div>Yükleniyor...</div>;
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

  const toggleExpand = (eventId) => {
    // Eğer aynı kart tıklanırsa kapat, farklıysa aç
    setExpandedCard(expandedCard === eventId ? null : eventId);
  };

  // Modal açma ve kapama
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);


  // Yeni etkinlik eklemek için formu handle etme
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();

    // Seçilen tarihin bugünden önce olup olmadığını kontrol et
    const selectedDate = new Date(newEvent.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Saat kısmını sıfırla (sadece tarih karşılaştırması için)

    if (selectedDate < today) {
        alert("Geçmiş tarihli etkinlik oluşturamazsınız!");
        return;
    }
  
    // Etkinlik verisini backend'e gönder
    axios
      .post(`/events/create/${userId}`, newEvent, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        alert("Etkinlik başarıyla oluşturuldu!");
        closeModal();
      })
      .catch((error) => {
        console.error("Etkinlik oluşturulurken hata:", error);
        alert("Etkinlik oluşturulurken bir hata oluştu.");
      });
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await fetch(`/events/join/${eventId}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const message = await response.text();
        alert(message); // Başarılı mesajını göster
      } else {
        const errorMessage = await response.text();
        alert('Hata: ' + errorMessage);
      }
    } catch (error) {
      console.error('Etkinliğe katılırken hata oluştu:', error);
      alert('Etkinliğe katılırken bir hata oluştu');
    }
  };

  const recommendedEventStyle = {
    border: '2px solid #007bff',
    boxShadow: '0 0 10px rgba(0,123,255,0.2)'
  };

  return (
    <div className="">
      {/* Navbar Bileşeni */}
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src={uk}
            alt="Profile"
            className="profile-photo"
          />
          <HomeIcon className="profile-photo" onClick={() => window.location.href = `/home/${userId}`}/>
          <button className="home-button" onClick={() => window.location.href = `/home/${userId}`}>Home</button>
        </div>
        <div className="navbar-right">
          <button className="add-event-button" onClick={openModal}>Etkinlik Ekle</button>
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

      {/* Modal: Etkinlik Ekleme */}
      {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Yeni Etkinlik Ekle</h3>
          <form onSubmit={handleEventSubmit}>
            <input
              type="text"
              name="eventName"
              placeholder="Etkinlik Adı"
              value={newEvent.eventName}
              onChange={handleEventChange}
              required
            />
            <input
              type="date"
              name="date"
              value={newEvent.date}
              onChange={handleEventChange}
              required
            />
            <input
              type="time"
              name="time"
              value={newEvent.time}
              onChange={handleEventChange}
              required
            />
            <input
              type="number"
              name="duration"
              placeholder="Süre (dakika)"
              value={newEvent.duration}
              onChange={handleEventChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Kategori"
              value={newEvent.category}
              onChange={handleEventChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Konum"
              value={newEvent.location}
              onChange={handleEventChange}
              required
            />
            <textarea
              name="description"
              placeholder="Açıklama"
              value={newEvent.description}
              onChange={handleEventChange}
              required
            />
            <button type="submit">Etkinlik Ekle</button>
            <button type="button" onClick={closeModal}>Kapat</button>
          </form>
        </div>
      </div>
      )}

      {/* Etkinlikler Listesi */}
      <div className="">
        {events.map((event) => (
          <div 
            key={event.eventID} 
            className="card-container"
            style={event.isRecommended ? recommendedEventStyle : {}}
          >
            {event.isRecommended && (
              <div className="recommended-badge">
                Önerilen Etkinlik
              </div>
            )}
            <h2 className="event-info">{event.eventName}</h2>
            <p className="event-info"><strong>Tarih:</strong> {event.date}</p>
            <p className="event-info"><strong>Kategori:</strong> {event.category}</p>

            {/* Harita */}
            <div className="map-container">
              <LoadScript googleMapsApiKey="">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{
                    lat: event.latitude,
                    lng: event.longitude,
                  }}
                  zoom={14}
                >
                  <Marker
                    position={{
                      lat: event.latitude,
                      lng: event.longitude,
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>

            {/* Genişletme İkonu */}
            <div className="expand-icon-container" onClick={() => toggleExpand(event.eventID)}>
              <ExpandMoreIcon style={{ cursor: "pointer" }} />
            </div>

            {/* Koşullu Genişletme İçeriği */}
            {expandedCard === event.eventID && (
              <div className="expanded-content">
                <p>{event.description}</p>
                <p><strong>Konum:</strong> {event.location}</p>
                <p><strong>Saat:</strong> {event.time.split(':').slice(0, 2).join(':')}</p>
                <button
                  className="join-event-button"
                  onClick={() => handleJoinEvent(event.eventID)}
                >
                  Etkinliğe Katıl
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
}


export default Home;
