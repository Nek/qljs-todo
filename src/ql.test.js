import {registerQuery, clearRegistry, parseQueryIntoMap, parseChildren} from './ql'
import createMultimethod from './multimethod'

const dispatch = ([first]) => first
const noMatch = (term) => {throw new Error('No match for ' + term)}
let reader = createMultimethod(dispatch, noMatch)
reader.name =  (term, {personId}, state) => {
      return state.people[personId].name
}
reader.age =  (term, {personId}, state) => {
      return state.people[personId].age
}
reader.people =  (term, env, state) => {
  const [, {personId}] = term
      if (personId) {
        return parseChildren(state, reader, term, {...env, personId})
      } else {
        const res = Object.keys(state.people)
              .map(personId => parseChildren(state, reader,term, {...env, personId}))
        return res
      }
    }

describe('ql', () => {
  const state = {people: {
    0: {name: 'Nik', age: 37},
    1: {name: 'Alya', age: 32}
  }}
  describe('parseQueryIntoMap', () => {
    it('should parse a simple query', () => {
      const query = [['name'], ['age']]
      const env = {personId:0}
      expect(parseQueryIntoMap(
        state,
        reader,
        query,
        env
      )).toEqual({atts:
                  {name: 'Nik', age: 37},
                  env: {personId: 0},
                  query})
    })
    it('should parse nested queries', () => {
      const query = [['people', {}, ['name'], ['age']]]
      const env = {}
      expect(parseQueryIntoMap(
        state,
        reader,
        query,
        env
      )).toEqual({
        atts: expect.anything(),
        env: expect.anything(),
        query: expect.anything(),
      })

      expect(parseQueryIntoMap(
        state,
        reader,
        query,
        env
      )).toEqual({
        atts: expect.objectContaining({
          people: [{atts: {name: 'Nik', age: 37},
                    env: expect.anything(),
                    query: expect.anything()},
                   {atts: {name: 'Alya', age: 32},
                    env: expect.anything(),
                    query: expect.anything()}]}),
        env: expect.anything(),
        query: expect.anything(),
      })

       expect(parseQueryIntoMap(
        state,
        reader,
        query,
        env
      )).toEqual({
        atts: {
          people: [
            {atts: expect.anything(),
             env: expect.anything(),
             query: [['name'],['age']]},
            {atts: expect.anything(),
             env: expect.anything(),
             query: [['name'],['age']]}
          ]},
        env: {},
        query,
      })

      expect(parseQueryIntoMap(
        state,
        reader,
        query,
        env
      )).toEqual({
        atts: {
          people: [
            {atts: expect.anything(),
             env:
             expect.objectContaining(
               {parentEnv:
                {personId: "0",
                 queryKey: "people"},
                personId: "0"}),
             query: [["name"], ["age"]]},
            {atts: expect.anything(),
             env: expect.anything(),
             query: [['name'],['age']]}
          ]},
        env: expect.anything(),
        query,
      })

    })



  })
})
