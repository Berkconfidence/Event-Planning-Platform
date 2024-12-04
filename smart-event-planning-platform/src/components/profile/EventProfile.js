import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Navbar.css';
import './Profile.css';
import uk from '../../assets/uk.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CommentIcon from '@mui/icons-material/Comment';


const mapContainerStyle = {
  width: '100%',
  height: '250px',
};

function EventProfile() {
  const { userId } = useParams();
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedTab, setSelectedTab] = useState('joined');
  const [createdEvents, setCreatedEvents] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    category: '',
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [expandedComments, setExpandedComments] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Kullanıcı bilgilerini al
    axios
      .get(`/users/${userId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => console.error("Kullanıcı bilgileri alınamadı:", error));

    // Katıldığım etkinlikleri al
    axios
      .get(`/events/joined/${userId}`)
      .then(response => {
        console.log(response.data);  // Veriyi buradan kontrol edin
        const eventsWithCoordinates = response.data.map(event => {
          return getCoordinates(event.location).then(coords => {
            return { ...event, latitude: coords.lat, longitude: coords.lng };
          });
        });

        Promise.all(eventsWithCoordinates).then(updatedEvents => {
          setJoinedEvents(updatedEvents);
          setIsLoading(false);
        });
      })
      .catch(error => {
        console.error("Etkinlik bilgileri alınamadı", error);
        setIsLoading(false);
      });

    // Oluşturulan etkinlikleri al
    if (selectedTab === 'created') {
      axios
        .get(`/events/created/${userId}`)
        .then(response => {
          const eventsWithCoordinates = response.data.map(event => {
            return getCoordinates(event.location).then(coords => {
              return { ...event, latitude: coords.lat, longitude: coords.lng };
            });
          });

          Promise.all(eventsWithCoordinates).then(updatedEvents => {
            setCreatedEvents(updatedEvents);
            setIsLoading(false);
          });
        })
        .catch(error => {
          console.error("Oluşturulan etkinlik bilgileri alınamadı", error);
          setIsLoading(false);
        });
    }
  }, [userId, selectedTab]);

  const getCoordinates = async (address) => {
    const googleMapsApiKey = "AIzaSyCMkmz6balxwr794m2BGcwQia1BsJ1AHZw";
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;

    try {
      const response = await axios.get(geocodeUrl);
      const location = response.data.results[0]?.geometry.location;
      return location ? { lat: location.lat, lng: location.lng } : { lat: 0, lng: 0 };
    } catch (error) {
      console.error("Geocoding API hatası:", error);
      return { lat: 0, lng: 0 };
    }
  };

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
    setExpandedCard(expandedCard === eventId ? null : eventId);
  };

  const handleEdit = (event) => {
    setEditingEventId(event.eventID);
    setNewEvent({
      eventName: event.eventName,
      description: event.description,
      date: event.date,
      time: event.time,
      duration: event.duration,
      location: event.location,
      category: event.category,
    });
    setModalOpen(true);
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const closeModal = () => setModalOpen(false);

  const confirmDelete = (eventID) => {
    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      handleDelete(eventID);
    } else {
      console.log("Silme işlemi iptal edildi.");
    }
  };
  
  const handleDelete = (eventID) => {
    console.log("Delete event ID:", eventID);
    // Silme işlemi için bir API çağrısı yapabilir ve listeyi güncelleyebilirsiniz.
    axios.delete(`/events/${eventID}`)
      .then(() => {
        setCreatedEvents(createdEvents.filter(event => event.eventID !== eventID));
      })
      .catch((error) => console.error("Etkinlik silinemedi:", error));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`/events/${editingEventId}`, {
        eventName: newEvent.eventName,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        duration: newEvent.duration,
        location: newEvent.location,
        category: newEvent.category
      });

      if (response.status === 200) {
        // Başarılı güncelleme durumunda
        alert('Etkinlik başarıyla güncellendi!');
        setModalOpen(false);
        
        // Etkinlik listesini güncelle
        if (selectedTab === 'created') {
          setCreatedEvents(createdEvents.map(event => 
            event.eventID === editingEventId ? response.data : event
          ));
        }
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Etkinlik güncellenirken bir hata oluştu: ' + 
        (error.response?.data || error.message));
    }
  };

  const fetchMessages = async (eventId) => {
    try {
      const response = await axios.get(`/messages/event/${eventId}`);
      console.log('Gelen mesajlar:', response.data); // Kontrol için
      setMessages(prev => ({
        ...prev,
        [eventId]: response.data
      }));
    } catch (error) {
      console.error("Mesajlar yüklenirken hata oluştu:", error);
    }
  };

  const toggleComments = async (eventId) => {
    if (expandedComments === eventId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(eventId);
      if (!messages[eventId]) {
        await fetchMessages(eventId);
      }
    }
  };

  const handleSendMessage = async (eventId) => {
    if (!newMessage.trim()) return;

    try {
      const messageRequest = {
        senderId: parseInt(userId),
        messageText: newMessage,
        eventId: eventId
      };

      const response = await axios.post(`/messages/${eventId}`, messageRequest);
      
      // Yeni mesajı listenin sonuna ekle
      setMessages(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), response.data].sort((a, b) => 
          new Date(a.sentTime) - new Date(b.sentTime)  // Tarihe göre artan sıralama
        )
      }));

      setNewMessage('');
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      alert("Mesaj gönderilemedi!");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mesajlar yüklendiğinde veya yeni mesaj eklendiğinde en alta scroll yap
  useEffect(() => {
    if (expandedComments !== null) {
      scrollToBottom();
    }
  }, [messages, expandedComments]);

  const renderEvents = () => {
    const events = selectedTab === 'joined' ? joinedEvents : createdEvents;
    
    if (events.length === 0) {
      return (
        <div className="no-events-message">
          <p>
            {selectedTab === 'joined' 
              ? 'Henüz hiçbir etkinliğe katılmadınız.' 
              : 'Henüz hiçbir etkinlik oluşturmadınız.'}
          </p>
        </div>
      );
    }

    return events.map((event) => (
      <div key={event.eventID} className="card-container">
        {/* Başlık ve Kategori */}
        <div className="card-header">
            <h2 className="event-info">{event.eventName}</h2>
            {selectedTab === 'created' && (
            <div className="icons-container">
                <EditIcon className="edit-icon" onClick={() => handleEdit(event)} />
                <DeleteIcon className="delete-icon" onClick={() => confirmDelete(event.eventID)}/>
            </div>
            )}
        </div>
        <p className="event-info"><strong>Tarih:</strong> {event.date}</p>
        <p className="event-info"><strong>Kategori:</strong> {event.category}</p>

        {/* Harita */}
        <div className="map-container">
          <LoadScript googleMapsApiKey="AIzaSyCMkmz6balxwr794m2BGcwQia1BsJ1AHZw">
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

        {/* Alt kısımdaki ikonlar */}
        <div className="bottom-icons-container">
          <div className="comment-icon-container" onClick={() => toggleComments(event.eventID)}>
            <CommentIcon />
          </div>
          <div className="expand-icon-container" onClick={() => toggleExpand(event.eventID)}>
            <ExpandMoreIcon />
          </div>
        </div>

        {/* Yorumlar bölümü */}
        {expandedComments === event.eventID && (
          <div className="comments-section">
            <h4>Yorumlar</h4>
            <div className="messages-container">
              {messages[event.eventID]?.length > 0 ? (
                <>
                  {messages[event.eventID].map((message) => (
                    <div key={`message-${message.messageID}`} className="message">
                      <div className="message-sender">
                        {message.username}
                      </div>
                      <div className="message-text">
                        {message.messageText}
                      </div>
                      <div className="message-time">
                        {message.sentTime ? new Date(message.sentTime).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        }) : ''}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <p className="no-messages">Henüz yorum yapılmamış.</p>
              )}
            </div>

            {/* Mesaj gönderme formu */}
            <div className="message-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Bir mesaj yazın..."
                className="message-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(event.eventID);
                  }
                }}
              />
              <button 
                className="send-message-btn"
                onClick={() => handleSendMessage(event.eventID)}
              >
                Gönder
              </button>
            </div>
          </div>
        )}

        {/* Mevcut expanded content */}
        {expandedCard === event.eventID && (
          <div className="expanded-content">
            <p>{event.description}</p>
            <p><strong>Konum:</strong> {event.location}</p>
            <p><strong>Saat:</strong> {event.time.split(':').slice(0, 2).join(':')}</p>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={uk} alt="Profile" className="profile-photo" />
          <HomeIcon className="profile-photo" onClick={() => window.location.href = `/home/${userId}`}/>
          <button className="home-button" onClick={() => window.location.href = `/home/${userId}`}>Home</button>
        </div>
        <div className="navbar-right">
          <button className="my-events-button" onClick={() => window.location.href = `/profile/${userId}`}>Profilim</button>
          <div className="profile-menu">
            <img
              src={`/${user?.profilePicturePath}`}
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

      {/* Tab Seçenekleri */}
      <div className="tabs-container">
        <div 
          className={`tab ${selectedTab === 'joined' ? 'active' : ''}`}
          onClick={() => setSelectedTab('joined')}
        >
          Katıldığım Etkinlikler
        </div>
        <div 
          className={`tab ${selectedTab === 'created' ? 'active' : ''}`}
          onClick={() => setSelectedTab('created')}
        >
          Oluşturduğum Etkinlikler
        </div>
      </div>

      {/* Etkinlikler Listesi */}
      <div className="events-container">
        {isLoading ? <div>Yükleniyor...</div> : renderEvents()}
      </div>

      {/* Modal: Etkinlik Düzenleme */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Etkinlik Düzenle</h3>
            <form onSubmit={handleUpdate}>
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
              <div className="button-container">
                <button type="submit">Güncelle</button>
                <button type="button" onClick={closeModal}>Kapat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventProfile;