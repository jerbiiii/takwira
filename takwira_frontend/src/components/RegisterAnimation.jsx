import { motion } from 'framer-motion';
import { FileCheck, Edit3 } from 'lucide-react';

const RegisterAnimation = ({ isLoading }) => {
  return (
    <div className="auth-animation-content">
      <div className="animation-scene register-scene">
        {/* The Contract */}
        <motion.div 
          className="contract"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="contract-header">
            <div className="club-logo">TFC</div>
            <h3>Contrat Officiel</h3>
          </div>
          <div className="contract-body">
            <div className="line"></div>
            <div className="line short"></div>
            <div className="line"></div>
            <div className="line medium"></div>
          </div>
          
          {/* Hand/Pen Animation */}
          <motion.div 
            className="signing-pen"
            initial={{ x: 20, y: 100 }}
            animate={isLoading ? {
              x: [20, 60, 20, 60],
              y: [100, 100, 105, 105]
            } : {
              x: [20, 100],
              y: [100, 100]
            }}
            transition={{
              duration: 2,
              repeat: isLoading ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <Edit3 size={24} color="var(--green-dark)" />
          </motion.div>
          
          {/* Signature appeared */}
          {!isLoading && (
            <motion.div 
              className="signature"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <svg viewBox="0 0 100 20" width="80" height="20">
                <path d="M 10,10 Q 30,5 50,15 T 90,10" fill="none" stroke="var(--green-dark)" strokeWidth="2" strokeDasharray="100" />
              </svg>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div 
        className="animation-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <FileCheck size={20} />
        <span>Préparation du contrat...</span>
      </motion.div>
    </div>
  );
};

export default RegisterAnimation;
