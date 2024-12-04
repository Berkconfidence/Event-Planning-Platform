import * as React from 'react';
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';

function ColorSchemeToggle(props) {
  const { onClick, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  

  React.useEffect(() => setMounted(true), []);

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      disabled={!mounted}
      onClick={(event) => {
        setMode(mode === 'light' ? 'dark' : 'light');
        onClick?.(event);
      }}
      {...other}
    >
      {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

const customTheme = extendTheme({ defaultColorScheme: 'dark' });

export default function JoySignUpSideTemplate() {
  const [gender, setGender] = React.useState("");
  
  const handleGenderChange = (event, newValue) => {
    setGender(newValue);
  };
  
  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Form-maxWidth': '800px',
            '--Transition-duration': '0.4s',
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '50vw' },
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: '100%',
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{ py: 3, display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}></Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: 'hidden',
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Kaydol
                </Typography>
                <Typography level="body-sm">
                  Zaten bir hesabın var mı?{' '}
                  <Link href="http://localhost:3000/login" level="title-sm">
                    Giriş Yap
                  </Link>
                </Typography>
              </Stack>
            </Stack>
            <Divider
              sx={(theme) => ({
                [theme.getColorSchemeSelector('light')]: {
                  color: { xs: '#FFF', md: 'text.tertiary' },
                },
              })}
            >
              ya da
            </Divider>
            <form
              onSubmit={async (event) => {
                event.preventDefault(); // Sayfa yenilemeyi engelle
                const formElements = event.currentTarget.elements;

                // FormData nesnesi oluştur
                const formData = new FormData();

                const dateOfBirth = formElements.dateOfBirth.value;
                const formattedDate = new Date(dateOfBirth).toISOString().split('T')[0]; // 'yyyy-mm-dd' formatında string'e çevir

                // Kullanıcı bilgilerini JSON string olarak ekle,
                formData.append(
                  "user",
                  JSON.stringify({
                    username: formElements.username.value,
                    password: formElements.password.value,
                    firstName: formElements.firstName.value,
                    lastName: formElements.lastName.value,
                    dateOfBirth: formattedDate,
                    gender,
                    email: formElements.email.value,
                    phoneNumber: formElements.phone.value,
                    interests: formElements.interests.value,
                    location: formElements.location.value
                  })
                );

                // Profil resmi varsa FormData'ya ekle
                const profilePicture = formElements.profilePicture.files[0]; // file input elementinden dosya alınır
                if (profilePicture) {
                  formData.append("profilePicture", profilePicture);
                }

                try {
                  // Backend'e isteği gönder
                  const response = await fetch("/users/signup", {
                    method: "POST",
                    body: formData,
                  });

                  if (response.ok) {
                    const responseData = await response.json();
                    console.log("Kullanıcı başarıyla oluşturuldu:", responseData);
                    alert("Kayıt başarılı!");
                    window.location.href = '/login';
                  } else {
                    const error = await response.text();
                    console.error("Hata oluştu:", error);
                    alert("Bir hata oluştu: " + error);
                  }
                } catch (error) {
                  console.error("Sunucuya bağlanırken hata:", error);
                  alert("Sunucuya bağlanırken bir hata oluştu.");
                }
              }}
            >
              <FormControl required>
                <FormLabel>Kullanıcı Adı</FormLabel>
                <Input type="text" name="username" />
              </FormControl>
              <FormControl required>
                <FormLabel>Şifre</FormLabel>
                <Input type="password" name="password" />
              </FormControl>
              <FormControl required>
                <FormLabel>Ad</FormLabel>
                <Input type="text" name="firstName" />
              </FormControl>
              <FormControl required>
                <FormLabel>Soyad</FormLabel>
                <Input type="text" name="lastName" />
              </FormControl>
              <FormControl required>
                <FormLabel>Doğum Tarihi</FormLabel>
                <Input type="date" name="dateOfBirth" />
              </FormControl>
              <FormControl required>
                <FormLabel>Cinsiyet</FormLabel>
                <Select
                  value={gender}
                  onChange={handleGenderChange}
                  placeholder="Seçiniz"
                >
                  <Option value="Erkek">Erkek</Option>
                  <Option value="Kadın">Kadın</Option>
                </Select>
              </FormControl>
              <FormControl required>
                <FormLabel>E-posta Adresi</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl required>
                <FormLabel>Telefon Numarası</FormLabel>
                <Input type="tel" name="phone" />
              </FormControl>
              <FormControl>
                <FormLabel>Lokasyon</FormLabel>
                <Textarea name="location"/>
              </FormControl>
              <FormControl>
                <FormLabel>İlgi Alanları</FormLabel>
                <Textarea name="interests" placeholder="İlgi alanlarınızı girin" />
              </FormControl>
              <FormControl>
                <FormLabel>Profil Fotoğrafı</FormLabel>
                <Input type="file" name="profilePicture" accept="image/*" />
              </FormControl>
              <Button type="submit" fullWidth>
                Kaydol
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: '50vw' },
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage:
              'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
          },
        })}
      />
    </CssVarsProvider>
  );
}
