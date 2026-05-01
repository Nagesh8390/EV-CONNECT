package com.evconnect.backend.config;

import com.evconnect.backend.entity.Station;
import com.evconnect.backend.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private StationRepository stationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the database stations table is currently empty
        if (stationRepository.count() == 0) {
            System.out.println("No stations found in the database. Seeding custom stations...");

            Station s1 = new Station();
            s1.setName("Andheri EV Fast Charge Hub");
            s1.setLatitude(19.1197);
            s1.setLongitude(72.8468);
            s1.setAddress("Andheri, Mumbai");
            s1.setPricePerKwh(18.0);
            s1.setTotalSlots(10);
            stationRepository.save(s1);

            Station s2 = new Station();
            s2.setName("Wakad Smart EV Station");
            s2.setLatitude(18.5995);
            s2.setLongitude(73.7636);
            s2.setAddress("Wakad, Pune");
            s2.setPricePerKwh(15.0);
            s2.setTotalSlots(12);
            stationRepository.save(s2);

            Station s3 = new Station();
            s3.setName("Baner Charging Point");
            s3.setLatitude(18.5590);
            s3.setLongitude(73.7868);
            s3.setAddress("Baner, Pune");
            s3.setPricePerKwh(16.0);
            s3.setTotalSlots(9);
            stationRepository.save(s3);

            Station s4 = new Station();
            s4.setName("Pune Central EV Station");
            s4.setLatitude(18.5308);
            s4.setLongitude(73.8475);
            s4.setAddress("Shivaji Nagar, Pune");
            s4.setPricePerKwh(15.0);
            s4.setTotalSlots(11);
            stationRepository.save(s4);

            Station s5 = new Station();
            s5.setName("Delhi Central EV Charger");
            s5.setLatitude(28.6315);
            s5.setLongitude(77.2167);
            s5.setAddress("Delhi Connaught Place");
            s5.setPricePerKwh(19.0);
            s5.setTotalSlots(15);
            stationRepository.save(s5);

            Station s6 = new Station();
            s6.setName("Bangalore Ultra Charge Station");
            s6.setLatitude(12.9716);
            s6.setLongitude(77.5946);
            s6.setAddress("Bangalore MG Road");
            s6.setPricePerKwh(17.0);
            s6.setTotalSlots(14);
            stationRepository.save(s6);

            Station s7 = new Station();
            s7.setName("Mumbai Ultra-Fast Charger (Bandra)");
            s7.setLatitude(19.0596);
            s7.setLongitude(72.8295);
            s7.setAddress("Bandra, Mumbai");
            s7.setPricePerKwh(18.0);
            s7.setTotalSlots(8);
            stationRepository.save(s7);

            Station s8 = new Station();
            s8.setName("Pune Tech Park Hub (Hinjewadi)");
            s8.setLatitude(18.5913);
            s8.setLongitude(73.7389);
            s8.setAddress("Hinjewadi, Pune");
            s8.setPricePerKwh(15.0);
            s8.setTotalSlots(10);
            stationRepository.save(s8);

            Station s9 = new Station();
            s9.setName("Nagpur Highway Express");
            s9.setLatitude(21.1458);
            s9.setLongitude(79.0882);
            s9.setAddress("Highway, Nagpur");
            s9.setPricePerKwh(14.5);
            s9.setTotalSlots(4);
            stationRepository.save(s9);

            Station s10 = new Station();
            s10.setName("Nashik City Center EV Hub");
            s10.setLatitude(20.0110);
            s10.setLongitude(73.7903);
            s10.setAddress("City Center, Nashik");
            s10.setPricePerKwh(16.0);
            s10.setTotalSlots(6);
            stationRepository.save(s10);

            System.out.println("Custom stations seeded successfully!");
        }
    }
}
