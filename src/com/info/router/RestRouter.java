package com.info.router;

import com.info.model.Person;
import com.info.service.PersonService;
import com.info.service.PersonServiceImpl;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/test") // Base path remains /api/test
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestRouter {

    private PersonService service = new PersonServiceImpl();

    // Original test route
    @GET
    @Path("/show")
    public Map<String, String> showMsg() {
        Map<String, String> mapMsg = new HashMap<>();
        mapMsg.put("statut", "ok");
        return mapMsg;
    }


    // GET /api/test/person/all
    @GET
    @Path("/person/all")
    public List<Person> getAllPersons() {
        return service.getAllPersons();
    }

    // GET /api/test/person/{id}
    @GET
    @Path("/person/{id}")
    public Person getPersonById(@PathParam("id") int id) {
        return service.getPerson(id);
    }

    // GET /api/test/person/name/{name}
    @GET
    @Path("/person/name/{name}")
    public Person getPersonByName(@PathParam("name") String name) {
        return service.getPersonByName(name);
    }

    // POST /api/test/person/add
    @POST
    @Path("/person/add")
    public boolean addPerson(Person p) {
        return service.addPerson(p);
    }

    // PUT /api/test/person/update
    @PUT
    @Path("/person/update")
    public boolean updatePerson(Person p) {
        return service.updatePerson(p);
    }

    // DELETE /api/test/person/delete/{id}
    @DELETE
    @Path("/person/delete/{id}")
    public boolean deletePerson(@PathParam("id") int id) {
        return service.deletePerson(id);
    }
}
