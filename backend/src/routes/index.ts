import { ohgoService } from '../services/ohgo';

const data = await ohgoService.getConstruction({
   route: 'I-75',
   activeOnly: true
});

console.log(data)
