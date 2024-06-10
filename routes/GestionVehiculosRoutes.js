const express = require("express");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
router.use('/Imagenes', express.static(path.join(__dirname, '..', 'front-end', 'src', 'assets', 'Imagenes')));




module.exports = function (servicio) {

   router.post('/api/AddVehiculo', async (req, res) => {



      try {

         const { Placa, Id_Tipovehiculo, Modelo, Id_Marca, Id_Tarifas, Disponible, Year, Url } = req.body;

         if (Placa.trim() == '' ||
            Modelo.trim() == '' ||
            Id_Marca <= 0 ||
            Id_Tipovehiculo <= 0 ||
            Id_Tarifas <= 0 ||
            Year == '' ||
            Url == 'assets/Imagenes/car-rent-10.png'
         ) {
          return res.status(400).json('VERIFIQUE IMAGENES Y CAMPOS');
         }

         if (Placa.trim() == ''){
            return res.status(400).json('VERIFIQUE IMAGENES Y CAMPOS');
         } 

          const ExisteVehiculo= await servicio.BuscarVehiculo(Placa);

          if (ExisteVehiculo){
            return res.status(400).json('Ya Existe Este Vehiculo,Verifique');
          }

         const validarLongitud=servicio.VerificarLongitudes(Placa,Year);

          if (!validarLongitud.EsCorrecta){
            return res.status(400).json(validarLongitud.Mensaje);
          }


         const response = await axios.get(Url, { responseType: 'arraybuffer' });
         const imageData = Buffer.from(response.data, 'binary');
         const uniqueFileName = uuidv4();
         const imagePath = path.join(__dirname, '..', '..', 'front-end', 'src', 'assets', 'Imagenes', `${uniqueFileName}.png`);



         fs.writeFileSync(imagePath, imageData);

         const relativePath = imagePath.replace(/^.*?assets/, 'assets').replace(/\\/g, '/'); //RUTA 



         console.log(relativePath);



         const Answer = await servicio.addVehiculo(Placa, Id_Tipovehiculo, Modelo, Id_Marca, Id_Tarifas, Disponible, Year, relativePath);


         res.status(200).json(Answer)

      } catch (error) {

         res.status(404).json(error);
      }

   })

   router.get('/api/getVehiculo', async (req, res) => {

      const Vehiculo = await servicio.getVehiculo();

      res.json(Vehiculo);
   })


   router.put('/api/UpdateVehiculo', async (req, res) => {

      const { Year, Modelo, Placa } = req.body

      const Answer = await servicio.UpdateVehiculo(Year, Modelo, Placa);


      res.json(Answer);
   })


   router.delete('/api/DeleteVehiculo/:Placa', async (req, res) => {

      const { Placa } = req.params

      const Answer = await servicio.DeleteVehiculo(Placa);

      res.json(Answer);
   })

   router.post('/api/BuscarVehiculo', async (req, res) => {

      const { Placa } = req.body


      const Answer = await servicio.BuscarVehiculo(Placa);

      res.json(Answer);

   })

   return router;
}